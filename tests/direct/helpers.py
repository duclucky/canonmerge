from __future__ import annotations

import json
import sys
from datetime import datetime, timezone

GEN = 10**18
BUDGET = 2 * GEN
BASE_TIME = 1893456000
SUBMIT_DEADLINE = BASE_TIME + 3600
REVIEW_DEADLINE = BASE_TIME + 7200
CONTRACT_PATH = "contracts/canonmerge.py"
LLM_PATTERN = r"(?s).*CanonMerge semantic judge.*"


def view(value) -> dict:
    return json.loads(value if isinstance(value, str) else str(value))


def set_time(vm, timestamp: int) -> None:
    text = datetime.fromtimestamp(timestamp, timezone.utc).isoformat().replace("+00:00", "Z")
    vm.warp(text)
    message_module = sys.modules.get("genlayer.message")
    if message_module is not None:
        message_module.raw["datetime"] = text
        message_module.datetime = text
    gl_module = sys.modules.get("genlayer.gl")
    if gl_module is not None and getattr(gl_module, "message_raw", None) is not None:
        gl_module.message_raw["datetime"] = text


def create_world(contract, vm, sponsor, writer_a, writer_b, world_id="world-1") -> None:
    set_time(vm, BASE_TIME)
    vm.sender = sponsor
    vm.value = BUDGET
    contract.create_world(world_id, "The Glass Archive", "A floating archive circles the city.", "The archive never lands and nobody can reverse time.", writer_a, writer_b, SUBMIT_DEADLINE, REVIEW_DEADLINE)
    vm.value = 0


def submit_pair(contract, vm, writer_a, writer_b, world_id="world-1") -> None:
    set_time(vm, BASE_TIME + 60)
    vm.sender = writer_a
    contract.submit_branch(world_id, "A", "Mira decodes the archive map from the tower.")
    vm.sender = writer_b
    contract.submit_branch(world_id, "B", "At dusk, Sol follows the same map into the lower stacks.")


def mock_verdict(vm, verdict="MERGEABLE", *, world_id="world-1", attempt_id="world-1-T-1", coverage=None, conflicts=None, rationale="Both changes coexist.") -> None:
    payload = {
        "world_id": world_id,
        "attempt_id": attempt_id,
        "parent_id": world_id + ":ROOT",
        "branch_a_id": world_id + ":A",
        "branch_b_id": world_id + ":B",
        "verdict": verdict,
        "coverage": coverage if coverage is not None else ["PARENT", "BRANCH_A", "BRANCH_B"],
        "conflicts": conflicts if conflicts is not None else ([] if verdict == "MERGEABLE" else ["A|B"]),
        "rationale": rationale,
    }
    vm.mock_llm(LLM_PATTERN, json.dumps(json.dumps(payload)))


def accounting_ok(data: dict) -> bool:
    return int(data["total_received"]) == int(data["total_locked"]) + int(data["total_credits"]) + int(data["total_withdrawn"])
