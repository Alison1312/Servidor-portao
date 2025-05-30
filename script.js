let senhaAutorizada = "alison321";

function login() {
  const senha = document.getElementById('senha').value;
  if (senha === senhaAutorizada) {
    document.getElementById('login-box').classList.add('hidden');
    document.getElementById('controls').classList.remove('hidden');
    statusPortao();
  } else {
    alert('Senha incorreta.');
  }
}

function acionar() {
  fetch('/abrir').then(r => r.text()).then(alert);
}

function statusPortao() {
  fetch('/status').then(r => r.text()).then(text => {
    document.getElementById('status').textContent = 'Status: ' + text;
  });
}

function modoCadastro() {
  fetch('/modo_cadastro?senha=' + senhaAutorizada).then(r => r.text()).then(alert);
}

function acionarLampada() {
  fetch('/ligar').then(r => r.text()).then(alert);
}

setInterval(() => {
  if (!document.getElementById('controls').classList.contains('hidden')) {
    statusPortao();
  }
}, 5000);