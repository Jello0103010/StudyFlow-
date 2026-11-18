const API = '/api/tasks';
const list = document.querySelector('#tasks');
const form = document.querySelector('#taskForm');
const message = document.querySelector('#message');
let filter = 'all'; let editingId = null;
function el(tag, className, text) { const node = document.createElement(tag); if (className) node.className = className; if (text !== undefined) node.textContent = text; return node; }
async function request(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) { let payload = {}; try { payload = await response.json(); } catch {} throw new Error(payload.error || `HTTP ${response.status}`); }
  return response.status === 204 ? null : response.json();
}
function notice(text, success = false) { message.textContent = text; message.className = success ? 'success' : ''; }
async function refresh() {
  try {
    const [all, shown] = await Promise.all([request(API), request(filter === 'all' ? API : `${API}?done=${filter}`)]);
    document.querySelector('#total').textContent = all.length;
    document.querySelector('#pending').textContent = all.filter(t => !t.done).length;
    document.querySelector('#completed').textContent = all.filter(t => t.done).length;
    document.querySelector('#listCount').textContent = `${shown.length} งาน`;
    list.replaceChildren();
    if (!shown.length) { list.append(el('div', 'empty', 'ยังไม่มีรายการงานในหมวดนี้ ✨')); return; }
    shown.sort((a,b) => a.dueDate.localeCompare(b.dueDate)).forEach(task => {
      const row = el('article', `task${task.done ? ' done' : ''}`);
      const toggle = el('button', `task-check${task.done ? ' checked' : ''}`, task.done ? '✓' : '');
      toggle.type = 'button'; toggle.title = task.done ? 'เปลี่ยนเป็นยังไม่เสร็จ' : 'ทำเครื่องหมายเสร็จแล้ว';
      toggle.setAttribute('aria-label', toggle.title);
      toggle.addEventListener('click', () => mutate(() => request(`${API}/${task.id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({done:!task.done}) })));
      const content = el('div', 'task-content'); content.append(el('div','task-title',task.title), el('div','task-meta',`${task.subject}  ·  กำหนดส่ง ${task.dueDate}`));
      const actions = el('div','task-actions');
      const edit = el('button','icon-btn','✎'); edit.title='แก้ไข'; edit.setAttribute('aria-label','แก้ไข '+task.title);
      edit.addEventListener('click', () => { editingId=task.id; form.elements.title.value=task.title; form.elements.subject.value=task.subject; form.elements.dueDate.value=task.dueDate; document.querySelector('#formHeading').textContent='✎ แก้ไขรายการงาน'; document.querySelector('#submitBtn').textContent='บันทึกการแก้ไข'; document.querySelector('#cancelBtn').hidden=false; form.elements.title.focus(); notice(''); });
      const remove = el('button','icon-btn delete','✕'); remove.title='ลบ'; remove.setAttribute('aria-label','ลบ '+task.title);
      remove.addEventListener('click', () => { if (confirm(`ต้องการลบงาน "${task.title}" หรือไม่?`)) mutate(() => request(`${API}/${task.id}`,{method:'DELETE'})); });
      actions.append(edit,remove); row.append(toggle,content,actions); list.append(row);
    });
  } catch(e) { list.replaceChildren(el('div','empty','โหลดข้อมูลไม่สำเร็จ: '+e.message)); }
}
async function mutate(action) { try { await action(); await refresh(); notice('บันทึกข้อมูลเรียบร้อย',true); } catch(e) { notice(e.message); } }
function resetForm() { form.reset(); editingId=null; document.querySelector('#formHeading').textContent='✚ เพิ่มงานใหม่'; document.querySelector('#submitBtn').textContent='+ เพิ่มรายการงาน'; document.querySelector('#cancelBtn').hidden=true; }
form.addEventListener('submit', async event => { event.preventDefault(); const data={title:form.elements.title.value.trim(),subject:form.elements.subject.value.trim(),dueDate:form.elements.dueDate.value}; const id=editingId; await mutate(async () => { await request(id ? `${API}/${id}` : API, {method:id?'PATCH':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}); resetForm(); }); });
document.querySelector('#cancelBtn').addEventListener('click', () => { resetForm(); notice(''); });
document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => { filter=button.dataset.filter; document.querySelectorAll('.filter').forEach(b=>b.classList.toggle('active',b===button)); refresh(); }));
refresh();