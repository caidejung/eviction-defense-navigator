import {defineConfig} from '@playwright/test'
export default defineConfig({
  testDir:'./tests',
  use:{baseURL:'http://127.0.0.1:4173',channel:process.env.CHROME_CHANNEL||undefined},
  webServer:{command:'npm run dev -- --host 127.0.0.1 --port 4173 --strictPort',url:'http://127.0.0.1:4173',reuseExistingServer:true},
  projects:[{name:'desktop',use:{viewport:{width:1280,height:800}}},{name:'mobile',use:{viewport:{width:375,height:812}}}]
})
