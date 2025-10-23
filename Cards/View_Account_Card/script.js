<<<<<<< HEAD
document.querySelectorAll('.nav-btn').forEach(btn=>{
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(n=>n.classList.remove('active'));
    btn.classList.add('active');

    const target = btn.getAttribute('data-target');
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    const el = document.getElementById(target);
    if(el) el.classList.add('active');

    document.querySelector('.right-card').scrollTop = 0;
  });
});

const editBtn = document.getElementById('editProfile');
const inputs = Array.from(document.querySelectorAll('#account input'));
let editing = false;

editBtn.addEventListener('click', () => {
  editing = !editing;
  inputs.forEach(i => i.disabled = !editing);
  editBtn.textContent = editing ? 'Cancel Edit' : 'Edit Profile';

  // show save button if editing (replace edit with Save/Cancel behavior)
  if(editing){
    const save = document.createElement('button');
    save.id = 'saveProfile';
    save.className = 'btn-success';
    save.textContent = 'Save Changes';
    save.style.marginLeft = '8px';
    editBtn.after(save);

    save.addEventListener('click', () => {
      inputs.forEach(i => i.disabled = true);
      editing = false;
      editBtn.textContent = 'Edit Profile';
      save.remove();
      alert('Profile updated successfully!');
    });
  } else {
    // if cancel edit, remove any save button if present
    const existing = document.getElementById('saveProfile');
    if(existing) existing.remove();
  }
});

// change profile photo only when editing: wire upload input
=======
const editBtn = document.getElementById('editProfile');
const inputs = document.querySelectorAll('.two-col input');
const avatar = document.getElementById('avatar');

let editing = false;
>>>>>>> 63b505a63800a278b92ce2b08dff24423b63d8a7
const uploadInput = document.createElement('input');
uploadInput.type = 'file';
uploadInput.accept = 'image/*';
uploadInput.style.display = 'none';
document.body.appendChild(uploadInput);

<<<<<<< HEAD
const leftAvatar = document.getElementById('leftAvatar');
const profileImage = document.getElementById('profileImage');
const changePhotoBtn = document.getElementById('editProfile'); // only trigger when editing

// click on avatar area will open file picker only when editing is active
leftAvatar.addEventListener('click', () => {
  if(!editing) return; // only editable when in edit mode
  uploadInput.click();
});
profileImage.addEventListener('click', () => {
  if(!editing) return;
  uploadInput.click();
});
uploadInput.addEventListener('change', (e) => {
  const f = e.target.files[0];
  if(!f) return;
  const r = new FileReader();
  r.onload = ev => {
    leftAvatar.src = ev.target.result;
    profileImage.src = ev.target.result;
  };
=======
editBtn.addEventListener('click', () => {
  editing = !editing;
  inputs.forEach(i => (i.disabled = !editing));
  editBtn.textContent = editing ? 'Save Changes' : 'Edit Profile';
  if (!editing) alert('Profile updated successfully!');
});

avatar.addEventListener('click', () => {
  if (!editing) return;
  uploadInput.click();
});

uploadInput.addEventListener('change', e => {
  const f = e.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = ev => (avatar.src = ev.target.result);
>>>>>>> 63b505a63800a278b92ce2b08dff24423b63d8a7
  r.readAsDataURL(f);
});
