const express = require('express');
const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const app = express();
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, 'tasks.json');
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

async function readTasks() {
  try { return JSON.parse(await fs.readFile(DATA_FILE, 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return []; throw error; }
}
async function saveTasks(tasks) { await fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2) + '\n', 'utf8'); }
function validate(body, partial = false) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return 'กรุณาส่งข้อมูลแบบ JSON object';
  const allowed = ['title', 'subject', 'dueDate', 'done'];
  if (Object.keys(body).some(k => !allowed.includes(k))) return 'มีชื่อฟิลด์ที่ไม่รองรับ';
  if (partial && Object.keys(body).length === 0) return 'กรุณาระบุข้อมูลที่ต้องการแก้ไข';
  for (const key of ['title', 'subject']) {
    if ((!partial || key in body) && (typeof body[key] !== 'string' || !body[key].trim())) return `กรุณากรอก ${key}`;
    if (key in body && body[key].trim().length > 120) return `${key} ยาวเกิน 120 ตัวอักษร`;
  }
  if ((!partial || 'dueDate' in body) && (typeof body.dueDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(body.dueDate) || Number.isNaN(Date.parse(body.dueDate)) || new Date(body.dueDate).toISOString().slice(0,10) !== body.dueDate)) return 'dueDate ต้องเป็นวันที่จริงในรูปแบบ YYYY-MM-DD';
  if ('done' in body && typeof body.done !== 'boolean') return 'done ต้องเป็น true หรือ false';
  return null;
}
app.get('/api/tasks', async (req, res, next) => {
  try {
    let tasks = await readTasks();
    if ('done' in req.query) {
      if (!['true','false'].includes(req.query.done)) return res.status(400).json({ error: 'done ต้องเป็น true หรือ false' });
      tasks = tasks.filter(task => task.done === (req.query.done === 'true'));
    }
    res.json(tasks);
  } catch (e) { next(e); }
});
app.get('/api/tasks/:id', async (req, res, next) => {
  try { const task = (await readTasks()).find(t => t.id === req.params.id); return task ? res.json(task) : res.status(404).json({ error: 'ไม่พบงานนี้' }); }
  catch (e) { next(e); }
});
app.post('/api/tasks', async (req, res, next) => {
  const error = validate(req.body);
  if (error) return res.status(400).json({ error });
  try {
    const tasks = await readTasks();
    const task = { id: randomUUID(), title: req.body.title.trim(), subject: req.body.subject.trim(), dueDate: req.body.dueDate, done: req.body.done ?? false, createdAt: new Date().toISOString() };
    tasks.push(task); await saveTasks(tasks);
    return res.status(201).location(`/api/tasks/${task.id}`).json(task);
  } catch (e) { next(e); }
});
app.patch('/api/tasks/:id', async (req, res, next) => {
  const error = validate(req.body, true);
  if (error) return res.status(400).json({ error });
  try {
    const tasks = await readTasks(); const index = tasks.findIndex(t => t.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'ไม่พบงานนี้' });
    const patch = { ...req.body };
    for (const key of ['title','subject']) if (key in patch) patch[key] = patch[key].trim();
    tasks[index] = { ...tasks[index], ...patch };
    await saveTasks(tasks); return res.json(tasks[index]);
  } catch (e) { next(e); }
});
app.delete('/api/tasks/:id', async (req, res, next) => {
  try { const tasks = await readTasks(); const index = tasks.findIndex(t => t.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'ไม่พบงานนี้' });
    tasks.splice(index, 1); await saveTasks(tasks); return res.status(204).end();
  } catch (e) { next(e); }
});
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && 'body' in error) return res.status(400).json({ error: 'JSON ไม่ถูกต้อง' });
  console.error(error); res.status(500).json({ error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
});
if (require.main === module) app.listen(process.env.PORT || 3000, () => console.log(`StudyFlow: http://localhost:${process.env.PORT || 3000}`));
module.exports = app;
