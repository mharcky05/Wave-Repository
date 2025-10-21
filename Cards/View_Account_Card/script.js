const editBtn = document.getElementById('editProfile');
const inputs = document.querySelectorAll('.two-col input');
const avatar = document.getElementById('avatar');

let editing = false;
const uploadInput = document.createElement('input');
uploadInput.type = 'file';
uploadInput.accept = 'image/*';
uploadInput.style.display = 'none';
document.body.appendChild(uploadInput);

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
  r.readAsDataURL(f);
});
