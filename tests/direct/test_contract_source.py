from __future__ import annotations
import ast
from pathlib import Path

CONTRACT = Path(__file__).parents[2] / "contracts" / "canonmerge.py"
HEADER = '# { "Depends": "py-genlayer:5jycge4q8k23462jtb0b9fyey1s9qz928sz2nbrd9mg4sxqg2qng" }'
WRITES = {"create_world", "submit_branch", "review_merge", "cancel_missing", "recover_unresolved", "withdraw_credit"}


def source(): return CONTRACT.read_text(encoding="ascii")


def test_contract_shape_and_header():
    text = source(); tree = ast.parse(text)
    assert text.splitlines()[0] == HEADER
    assert text.isascii()
    classes = [n for n in tree.body if isinstance(n, ast.ClassDef) and any(ast.unparse(b) == "gl.contract.Contract" for b in n.bases)]
    assert [n.name for n in classes] == ["CanonMerge"]


def test_public_surface_and_payability():
    tree = ast.parse(source()); cls = next(n for n in tree.body if isinstance(n, ast.ClassDef) and n.name == "CanonMerge")
    methods = {n.name:n for n in cls.body if isinstance(n, ast.FunctionDef)}
    assert WRITES <= methods.keys()
    decos = lambda n: {ast.unparse(d) for d in n.decorator_list}
    assert "gl.public.write.payable" in decos(methods["create_world"])
    for name in WRITES - {"create_world"}:
        assert "gl.public.write" in decos(methods[name])
        assert "gl.public.write.payable" not in decos(methods[name])


def test_contract_owns_consensus_time_and_value_safety():
    text = source(); tree = ast.parse(text); cls = next(n for n in tree.body if isinstance(n, ast.ClassDef) and n.name == "CanonMerge")
    methods = {n.name:ast.unparse(n) for n in cls.body if isinstance(n, ast.FunctionDef)}
    assert "gl.vm.run_nondet" in text and "gl.nondet.exec_prompt" in text
    assert "gl.message.value" in methods["create_world"]
    assert "submit_deadline" in methods["submit_branch"]
    assert "review_deadline" in methods["review_merge"]
    assert "submit_deadline" in methods["cancel_missing"]
    assert "review_deadline" in methods["recover_unresolved"]
    assert methods["withdraw_credit"].find("credit.amount = bigint(0)") < methods["withdraw_credit"].find("emit_transfer")
