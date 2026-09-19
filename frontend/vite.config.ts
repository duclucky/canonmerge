import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({plugins:[react()],server:{proxy:{'/genlayer-rpc':{target:'https://studio-dev.genlayer.com',changeOrigin:true,rewrite:()=>'/api'}}},test:{environment:'node'}})
