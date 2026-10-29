const form = document.getElementById('registrationForm');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const resumeInput = document.getElementById('resume');
const fileName = document.getElementById('fileName');
const objective = document.getElementById('objective');
const objectiveCount = document.getElementById('objectiveCount');
const modal = document.getElementById('successModal');
const summaryBox = document.getElementById('summaryBox');

const requiredFields = ['fullName', 'email', 'phone', 'resume'];
const trackedFields = [
  'fullName', 'email', 'phone', 'dob', 'gender', 'city', 'address',
  'school10', 'board10', 'marks10', 'school12', 'stream12', 'marks12',
  'degree', 'branch', 'college', 'gradYear', 'cgpa', 'backlogs',
  'skillLevel', 'role', 'projectTitle', 'experience', 'projectDescription',
  'objective', 'linkedin', 'github', 'portfolio'
];

const gradYear = document.getElementById('gradYear');
for (let year = new Date().getFullYear(); year <= new Date().getFullYear() + 8; year++) {
  const option = document.createElement('option');
  option.value = String(year);
  option.textContent = String(year);
  gradYear.appendChild(option);
}

function setError(input, message) {
  input.classList.toggle('invalid', Boolean(message));
  const field = input.closest('.field');
  const error = field ? field.querySelector('.error') : null;
  if (error) error.textContent = message || '';
}

function isValidUrl(value) {
  if (!value.trim()) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function validateField(input) {
  const value = input.value.trim();
  let message = '';

  if (input.required && input.type !== 'file' && !value) {
    message = 'This field is required.';
  } else if (input.id === 'fullName' && value && value.length < 2) {
    message = 'Please enter at least 2 characters.';
  } else if (input.id === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    message = 'Enter a valid email address.';
  } else if (input.id === 'phone' && value && !/^[6-9]\d{9}$/.test(value)) {
    message = 'Enter a valid 10-digit Indian mobile number.';
  } else if (['linkedin', 'github', 'portfolio'].includes(input.id) && !isValidUrl(value)) {
    message = 'Enter a valid link starting with http:// or https://.';
  } else if (input.type === 'number' && value) {
    const number = Number(value);
    if (number < Number(input.min) || number > Number(input.max)) {
      message = `Enter a value between ${input.min} and ${input.max}.`;
    }
  }

  setError(input, message);
  return !message;
}

function updateProgress() {
  let total = trackedFields.length + 4;
  let completed = trackedFields.filter(id => document.getElementById(id).value.trim()).length;
  if (document.querySelectorAll('input[name="skills"]:checked').length) completed++;
  if (document.querySelectorAll('input[name="languages"]:checked').length) completed++;
  if (resumeInput.files.length) completed++;
  if (document.getElementById('consent').checked) completed++;
  const percent = Math.round((completed / total) * 100);
  progressFill.style.width = `${percent}%`;
  progressText.textContent = `${percent}%`;
}

trackedFields.forEach(id => {
  const input = document.getElementById(id);
  input.addEventListener('input', () => {
    if (input.value.trim()) validateField(input);
    updateProgress();
  });
  input.addEventListener('change', updateProgress);
});

document.querySelectorAll('input[name="skills"], input[name="languages"], #consent').forEach(input => {
  input.addEventListener('change', updateProgress);
});

objective.addEventListener('input', () => {
  objectiveCount.textContent = objective.value.length;
});

resumeInput.addEventListener('change', () => {
  const file = resumeInput.files[0];
  const error = document.getElementById('resumeError');
  error.textContent = '';
  fileName.textContent = file ? file.name : 'No file selected';
  if (file) {
    const allowed = /\.(pdf|doc|docx)$/i.test(file.name);
    if (!allowed) {
      error.textContent = 'Please upload a PDF, DOC, or DOCX file.';
      resumeInput.value = '';
      fileName.textContent = 'No file selected';
    } else if (file.size > 5 * 1024 * 1024) {
      error.textContent = 'File size must be 5 MB or less.';
      resumeInput.value = '';
      fileName.textContent = 'No file selected';
    }
  }
  updateProgress();
});

form.addEventListener('submit', event => {
  event.preventDefault();
  let valid = true;

  ['fullName', 'email', 'phone'].forEach(id => {
    if (!validateField(document.getElementById(id))) valid = false;
  });

  ['linkedin', 'github', 'portfolio'].forEach(id => {
    if (!validateField(document.getElementById(id))) valid = false;
  });

  const skills = document.querySelectorAll('input[name="skills"]:checked');
  const skillsError = document.getElementById('skillsError');
  skillsError.textContent = skills.length ? '' : 'Please select at least one technical skill.';
  if (!skills.length) valid = false;

  const resumeError = document.getElementById('resumeError');
  const file = resumeInput.files[0];
  if (!file) {
    resumeError.textContent = 'Please upload your resume.';
    valid = false;
  } else if (!/\.(pdf|doc|docx)$/i.test(file.name) || file.size > 5 * 1024 * 1024) {
    resumeError.textContent = 'Upload a PDF/DOC/DOCX file no larger than 5 MB.';
    valid = false;
  } else {
    resumeError.textContent = '';
  }

  const consent = document.getElementById('consent');
  document.getElementById('consentError').textContent = consent.checked ? '' : 'Please confirm before submitting.';
  if (!consent.checked) valid = false;

  if (!valid) {
    const firstInvalid = form.querySelector('.invalid, #skillsError:not(:empty), #resumeError:not(:empty), #consentError:not(:empty)');
    if (firstInvalid) firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const name = document.getElementById('fullName').value.trim();
  const selectedSkills = [...skills].map(item => item.value).join(', ');
  summaryBox.innerHTML = `<strong>Name:</strong> ${escapeHtml(name)}<br><strong>Email:</strong> ${escapeHtml(document.getElementById('email').value.trim())}<br><strong>Skills:</strong> ${escapeHtml(selectedSkills)}<br><strong>Resume:</strong> ${escapeHtml(file.name)}`;
  modal.hidden = false;
  document.getElementById('closeModal').focus();
});

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

document.getElementById('closeModal').addEventListener('click', () => {
  modal.hidden = true;
});

modal.addEventListener('click', event => {
  if (event.target === modal) modal.hidden = true;
});

form.addEventListener('reset', () => {
  setTimeout(() => {
    form.querySelectorAll('.invalid').forEach(input => input.classList.remove('invalid'));
    form.querySelectorAll('.error').forEach(error => error.textContent = '');
    fileName.textContent = 'No file selected';
    objectiveCount.textContent = '0';
    updateProgress();
  }, 0);
});

updateProgress();
