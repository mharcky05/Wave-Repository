/* ---------- Admin Dashboard prototype script ---------- */

/* Simple in-memory data (samples) */
const db = {
  guests: [
    { id: 'G-001', fname: 'Juan', lname: 'Dela Cruz', contact: '09171234567', email: 'juan@example.com', status: 'Active' },
    { id: 'G-002', fname: 'Mharcky', lname: 'Conquilla', contact: '09129876543', email: 'mharcky@example.com', status: 'Active' }
  ],
  reservations: [
    { id:'R-1001', guest:'Juan Dela Cruz', pkg:'Deluxe Villa', checkin:'2025-10-20', checkout:'2025-10-22', pax:4, status:'Confirmed', total:18500 },
    { id:'R-1002', guest:'Mharcky Conquilla', pkg:'Daytime Package', checkin:'2025-11-05', checkout:'2025-11-05', pax:10, status:'Pending', total:5500 }
  ],
  payments: [
    { id:'P-5001', reserve:'R-1001', amount:18500, method:'GCash', status:'Verified' },
    { id:'P-5002', reserve:'R-1002', amount:2000, method:'Bank', status:'Pending' }
  ],
  notifications: []
};

/* Short helpers */
const q = sel => document.querySelector(sel);
const qa = sel => document.querySelectorAll(sel);
const fmt = n => '₱' + Number(n).toLocaleString();

/* Render header stats */
function renderStats(){
  q('#statGuests').textContent = db.guests.length;
  q('#cardGuests').textContent = db.guests.length;
  q('#statRes').textContent = db.reservations.length;
  q('#cardRes').textContent = db.reservations.length;
  const revenue = db.payments.reduce((s,p)=> s + (p.amount||0),0);
  q('#statRev').textContent = fmt(revenue);
  q('#cardRevenue').textContent = fmt(revenue);
}
renderStats();

/* Sidebar navigation */
qa('.menu-link').forEach(btn=>{
  btn.addEventListener('click', () => {
    qa('.menu-link').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const target = btn.dataset.target;
    qa('.panel').forEach(p=>p.classList.remove('active-panel'));
    const el = q('#'+target);
    if(el) el.classList.add('active-panel');
  });
});

/* Modal utilities */
function openModal(html){
  const modal = q('#modal');
  q('#modalContent').innerHTML = html;
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden','false');
}
q('#closeModal').addEventListener('click', ()=> {
  q('#modal').classList.add('hidden');
  q('#modal').setAttribute('aria-hidden','true');
});

/* Populate tables and lists */
function populateReservations(){
  const tbody = q('#resTable tbody');
  tbody.innerHTML = '';
  db.reservations.forEach(r=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r.id}</td><td>${r.guest}</td><td>${r.pkg}</td><td>${r.checkin}</td><td>${r.checkout}</td>
      <td>${r.pax}</td><td>${r.status}</td>
      <td>
        <button class="small-btn" data-action="view" data-id="${r.id}">View</button>
        <button class="small-btn" data-action="approve" data-id="${r.id}">Approve</button>
        <button class="small-btn" data-action="cancel" data-id="${r.id}">Cancel</button>
      </td>`;
    tbody.appendChild(tr);
  });
  // attach handlers
  qa('#resTable tbody button').forEach(b=>{
    b.addEventListener('click', ()=>{
      const id = b.dataset.id, action = b.dataset.action;
      if(action==='view') openModal(renderReservationDetail(id));
      if(action==='approve'){ updateReservationStatus(id,'Confirmed'); alert(`Reservation ${id} approved.`); renderAll(); }
      if(action==='cancel'){ updateReservationStatus(id,'Cancelled'); alert(`Reservation ${id} cancelled.`); renderAll(); }
    });
  });
}

function renderReservationDetail(id){
  const r = db.reservations.find(x=>x.id===id);
  if(!r) return `<p>Not found</p>`;
  return `<h3>Reservation ${r.id}</h3>
    <p><strong>Guest:</strong> ${r.guest}</p>
    <p><strong>Package:</strong> ${r.pkg}</p>
    <p><strong>Check-in:</strong> ${r.checkin}</p>
    <p><strong>Check-out:</strong> ${r.checkout}</p>
    <p><strong>Guests:</strong> ${r.pax}</p>
    <p><strong>Status:</strong> ${r.status}</p>
    <div class="form-actions">
      <button id="editRes" class="small-btn">Edit</button>
      <button id="closeModal2" class="small-btn">Close</button>
    </div>
    <script>
      document.getElementById('closeModal2').addEventListener('click', ()=>document.getElementById('modal').classList.add('hidden'));
      document.getElementById('editRes').addEventListener('click', ()=>{ alert('Open edit reservation form (sample).'); });
    <\/script>`;
}

function updateReservationStatus(id,status){
  const res = db.reservations.find(r=>r.id===id);
  if(res) res.status = status;
  createNotification({ title:`Reservation ${status}`, message:`Reservation ${id} has been ${status.toLowerCase()}.`, type:'reservation' });
  renderAll();
}

function populatePayments(){
  const tbody = q('#paymentsTable tbody');
  tbody.innerHTML = '';
  db.payments.forEach(p=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${p.id}</td><td>${p.reserve}</td><td>${fmt(p.amount)}</td><td>${p.method}</td><td>${p.status}</td>
      <td>
        <button class="small-btn" data-pay="${p.id}" data-act="view">View</button>
        <button class="small-btn" data-pay="${p.id}" data-act="verify">Verify</button>
      </td>`;
    tbody.appendChild(tr);
  });
  qa('#paymentsTable tbody button').forEach(b=>{
    b.addEventListener('click', ()=>{
      const id = b.dataset.pay, act = b.dataset.act;
      if(act==='view') alert(`View payment ${id} (sample).`);
      if(act==='verify'){ verifyPayment(id); }
    });
  });
}

function verifyPayment(id){
  const p = db.payments.find(x=>x.id===id);
  if(!p) return alert('Payment not found');
  p.status = 'Verified';
  createNotification({title:'Payment Verified', message:`Payment ${id} marked verified.`, type:'payment'});
  renderAll();
  alert(`Payment ${id} verified.`);
}

function populateGuests(){
  const tbody = q('#guestsTable tbody');
  tbody.innerHTML = '';
  db.guests.forEach(g=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${g.id}</td><td>${g.fname} ${g.lname}</td><td>${g.contact}</td><td>${g.email}</td><td>${g.status}</td>
      <td>
        <button class="small-btn" data-guest="${g.id}" data-act="view">View</button>
        <button class="small-btn" data-guest="${g.id}" data-act="edit">Edit</button>
      </td>`;
    tbody.appendChild(tr);
  });
  qa('#guestsTable tbody button').forEach(b=>{
    b.addEventListener('click', ()=>{
      const id=b.dataset.guest, act=b.dataset.act;
      if(act==='view') openModal(`<h3>Guest ${id}</h3><p>Sample details.</p><div class="form-actions"><button onclick="document.getElementById('modal').classList.add('hidden')" class="small-btn">Close</button></div>`);
      if(act==='edit') alert('Open edit guest form (sample).');
    });
  });
}

function populatePackages(){
  const wrap = q('#packagesList');
  wrap.innerHTML = '';
  const packages = [...new Set(db.reservations.map(r=>r.pkg))];
  packages.forEach((p,idx)=>{
    const card = document.createElement('div');
    card.className='card';
    card.innerHTML = `<h3>${p}</h3><p>Sample description</p><div class="form-actions"><button class="small-btn" data-pkg="${idx}">Edit</button><button class="small-btn" data-pkg="${idx}" onclick="alert('Delete package (sample)')">Delete</button></div>`;
    wrap.appendChild(card);
  });
}

function populateAmenities(){
  const wrap = q('#amenList'); wrap.innerHTML='';
  ['Pool','WiFi','Karaoke','Parking'].forEach((a)=>{
    const card=document.createElement('div'); card.className='card';
    card.innerHTML=`<h3>${a}</h3><p>Manage ${a}</p><div class="form-actions"><button class="small-btn">Edit</button></div>`;
    wrap.appendChild(card);
  });
}

function populateGallery(){
  const wrap=q('#galleryGrid'); wrap.innerHTML='';
  ['hero1.jpg','villa1.jpg','pool.jpg'].forEach(file=>{
    const c=document.createElement('div'); c.className='card';
    c.innerHTML=`<h4>${file}</h4><p>Media</p><div class="form-actions"><button class="small-btn">Replace</button></div>`;
    wrap.appendChild(c);
  });
}

function populateReviews(){
  const wrap=q('#reviewsList'); wrap.innerHTML='';
  [{id:'RV-1',name:'Guest A',rating:5,text:'Great!'}].forEach(r=>{
    const c=document.createElement('div'); c.className='card';
    c.innerHTML=`<h4>${r.name} — ${'★'.repeat(r.rating)}</h4><p>${r.text}</p><div class="form-actions"><button class="small-btn">Approve</button><button class="small-btn">Hide</button></div>`;
    wrap.appendChild(c);
  });
}

function populateInquiries(){
  const wrap=q('#inqList'); wrap.innerHTML='';
  [{id:'I-1',name:'User',msg:'What time check-in?'}].forEach(i=>{
    const c=document.createElement('div'); c.className='card';
    c.innerHTML=`<h4>${i.name}</h4><p>${i.msg}</p><div class="form-actions"><button class="small-btn">Reply</button></div>`;
    wrap.appendChild(c);
  });
}

/* Notifications management */
function renderNotifications(){
  const items = q('#notifItems');
  items.innerHTML='';
  db.notifications.slice().reverse().forEach((n)=>{
    const div = document.createElement('div');
    div.className = 'notif-item' + (n.read? '':' unread');
    div.innerHTML = `<div style="flex:1"><strong>${n.title}</strong><div style="font-size:13px;color:#444">${n.message}</div><div style="font-size:11px;color:#888">${n.time}</div></div>
      <div style="margin-left:8px"><button class="link-btn" data-id="${n.id}">Mark</button></div>`;
    items.appendChild(div);
    div.querySelector('button').addEventListener('click', ()=>{
      n.read=true; renderNotifications(); updateNotifCount();
    });
  });
  updateNotifCount();
}

function updateNotifCount(){
  const unread = db.notifications.filter(n=>!n.read).length;
  q('#notifCount').textContent = unread;
  renderStats();
}

function createNotification({title,message,type='general'}){
  const id = 'N-'+Date.now();
  const time = new Date().toLocaleString();
  db.notifications.push({id,title,message,type,time,read:false});
  renderNotifications();
}

/* Quick actions */
q('#newReservation').addEventListener('click', ()=>{
  const newid = 'R-'+(1000 + db.reservations.length + 1);
  const guest = `Guest ${db.reservations.length+1}`;
  const res = { id: newid, guest, pkg:'Daytime Package', checkin:'2025-12-01', checkout:'2025-12-01', pax:6, status:'Pending', total:5500 };
  db.reservations.push(res);
  createNotification({title:'New Reservation', message:`${res.guest} made reservation ${res.id}` , type:'reservation'});
  alert(`Simulated new reservation ${res.id} created.`);
  renderAll();
});

q('#addPackage').addEventListener('click', ()=>{
  openModal(`<h3>Add Package (sample)</h3>
    <label>Package Name <input id="pkgName"/></label>
    <label>Price <input id="pkgPrice"/></label>
    <div class="form-actions"><button id="savePkg" class="small-btn">Save</button><button id="cancelPkg" class="small-btn">Cancel</button></div>
    <script>
      document.getElementById('cancelPkg').addEventListener('click', ()=>document.getElementById('modal').classList.add('hidden'));
      document.getElementById('savePkg').addEventListener('click', ()=>{
        const name = document.getElementById('pkgName').value || 'New Package';
        alert('Package \"'+name+'\" added (sample).');
        document.getElementById('modal').classList.add('hidden');
      });
    <\/script>`);
});

q('#sendAnnouncement').addEventListener('click', ()=>{
  const msg = prompt('Enter announcement message (sample):','Holiday promo this weekend!');
  if(msg) {
    createNotification({title:'Announcement', message: msg, type:'system'});
    alert('Announcement sent to notifications (sample).');
  }
});

/* Notifications dropdown toggle & controls */
q('#notifBtn').addEventListener('click', ()=> q('#notifDropdown').classList.toggle('hidden') );
q('#clearNotifSmall').addEventListener('click', ()=>{
  if(confirm('Clear all notifications?')){ db.notifications = []; renderNotifications(); renderAll(); }
});
q('#markAllRead').addEventListener('click', ()=> { db.notifications.forEach(n=>n.read=true); renderNotifications(); });

/* Panel shortcuts */
q('#viewGuestsBtn').addEventListener('click', ()=> document.querySelector('[data-target="guests"]').click() );
q('#viewResBtn').addEventListener('click', ()=> document.querySelector('[data-target="reservations"]').click() );
q('#viewPaymentsBtn').addEventListener('click', ()=> document.querySelector('[data-target="payments"]').click() );

/* Panel action listeners (dummy feedback) */
q('#resRefresh').addEventListener('click', ()=>{ populateReservations(); alert('Reservations refreshed (sample).'); });
q('#resExport').addEventListener('click', ()=>{ alert('Export CSV (sample).'); });
q('#payRefresh').addEventListener('click', ()=>{ populatePayments(); alert('Payments refreshed (sample).'); });
q('#payVerifyAll').addEventListener('click', ()=>{ db.payments.forEach(p=>p.status='Verified'); alert('All pending payments verified (sample).'); renderAll(); });
q('#guestRefresh').addEventListener('click', ()=>{ populateGuests(); alert('Guests refreshed (sample).'); });
q('#addGuestBtn').addEventListener('click', ()=>{ openModal(`<h3>Add Guest (sample)</h3><label>First name<input id="gfn"></label><label>Last name<input id="gln"></label><div class="form-actions"><button id="saveG" class="small-btn">Save</button><button id="cancelG" class="small-btn">Cancel</button></div><script>document.getElementById('cancelG').addEventListener('click', ()=>document.getElementById('modal').classList.add('hidden'));document.getElementById('saveG').addEventListener('click', ()=>{ alert('Guest added (sample).'); document.getElementById('modal').classList.add('hidden'); });<\/script>`); });

q('#pkgAddBtn')?.addEventListener('click', ()=>{ alert('Open Add Package form (sample).'); });
q('#amenAddBtn')?.addEventListener('click', ()=>{ alert('Open Add Amenity form (sample).'); });
q('#galleryAdd')?.addEventListener('click', ()=>{ alert('Open Gallery upload (sample).'); });

/* Render all content */
function renderAll(){
  populateReservations();
  populatePayments();
  populateGuests();
  populatePackages();
  populateAmenities();
  populateGallery();
  populateReviews();
  populateInquiries();
  renderNotifications();
  renderStats();
}
renderAll();

/* Profile */
q('#saveProfile').addEventListener('click', (e)=>{ e.preventDefault(); alert('Profile saved (sample).'); });
q('#logout2').addEventListener('click', ()=>{ if(confirm('Logout?')) alert('Logged out (sample).'); });
q('#logoutBtn').addEventListener('click', ()=>{ if(confirm('Logout now?')) alert('Logged out (sample).'); });

/* initial notifications */
createNotification({title:'System', message:'Admin dashboard initialized', type:'system'});
createNotification({title:'Payment Received', message:'P-5001 paid for R-1001', type:'payment'});

// /* Real-time simulation (optional) */
// let realtimeInterval = setInterval(()=>{
//   if(db.reservations.length>8) return;
//   const newid = 'R-'+(1000 + db.reservations.length + 1);
//   const guest = `AutoGuest${db.reservations.length+1}`;
//   const res = { id: newid, guest, pkg:'Daytime Package', checkin:'2026-01-01', checkout:'2026-01-01', pax:4, status:'Pending', total:5500 };
//   db.reservations.push(res);
//   createNotification({title:'New Reservation', message:`${res.guest} made reservation ${res.id}` , type:'reservation'});
//   renderAll();
// }, 20000);

// window.addEventListener('beforeunload', ()=> clearInterval(realtimeInterval) );
