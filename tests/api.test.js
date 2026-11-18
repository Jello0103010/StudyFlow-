const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const temp = fs.mkdtempSync(path.join(os.tmpdir(),'studyflow-'));
process.env.DATA_FILE = path.join(temp,'tasks.json');
const app = require('../server/app');
const server = app.listen(0);
after(() => { server.close(); fs.rmSync(temp,{recursive:true,force:true}); });
async function call(method, endpoint, body) { const response = await fetch(`http://127.0.0.1:${server.address().port}${endpoint}`,{method,headers:{'Content-Type':'application/json'},body:body === undefined ? undefined : JSON.stringify(body)}); return {status:response.status,data:response.status===204?null:await response.json()}; }
test('CRUD + query filter + validation + status codes', async () => {
  assert.equal((await call('GET','/api/tasks')).status,200);
  assert.equal((await call('POST','/api/tasks',{title:''})).status,400);
  const created = await call('POST','/api/tasks',{title:'ทำรายงาน',subject:'Web Programming',dueDate:'2026-12-01'});
  assert.equal(created.status,201); assert.equal(created.data.done,false);
  const id=created.data.id;
  assert.equal((await call('GET',`/api/tasks/${id}`)).status,200);
  assert.equal((await call('GET','/api/tasks?done=false')).data.length,1);
  assert.equal((await call('GET','/api/tasks?done=true')).data.length,0);
  assert.equal((await call('GET','/api/tasks?done=maybe')).status,400);
  assert.equal((await call('PATCH',`/api/tasks/${id}`,{done:true})).status,200);
  assert.equal((await call('GET','/api/tasks?done=true')).data.length,1);
  assert.equal((await call('PATCH','/api/tasks/unknown',{done:true})).status,404);
  assert.equal((await call('GET','/api/tasks/unknown')).status,404);
  assert.equal((await call('DELETE',`/api/tasks/${id}`)).status,204);
  assert.equal((await call('DELETE',`/api/tasks/${id}`)).status,404);
});