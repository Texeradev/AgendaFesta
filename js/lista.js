
fetch("navbar.html")
  .then(response => response.text())
  .then(data => {
    document.body.insertAdjacentHTML("afterbegin", data);
  })
  .catch(error => console.error("Erro ao carregar o navbar:", error));

fetch("footer.html")
  .then(response => response.text())
  .then(data => {
    document.body.insertAdjacentHTML("beforeend", data);
  })
  .catch(error => console.error("Erro ao carregar o footer:", error));



document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".calendar-card");
  const currentYear = new Date().getFullYear();

  cards.forEach(card => {
    const month = parseInt(card.dataset.month, 10);
    const year = card.dataset.year ? parseInt(card.dataset.year, 10) : currentYear;
    buildCalendar(card, month, year);
  });

  markAllSavedAniversarios();
  atualizarLista();
});


function buildCalendar(container, month, year) {
  container.innerHTML = `
    <div class="calendar">
      <div class="header"><div class="monthYear"></div></div>
      <div class="days">
        <div class="day">Seg</div><div class="day">Ter</div><div class="day">Qua</div>
        <div class="day">Qui</div><div class="day">Sex</div><div class="day">Sáb</div><div class="day">Dom</div>
      </div>
      <div class="dates"></div>
    </div>
  `;

  const monthEl = container.querySelector(".monthYear");
  const datesEl = container.querySelector(".dates");

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const firstIndex = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const totalDays = lastDay.getDate();

  const name = new Date(year, month).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  monthEl.textContent = name.charAt(0).toUpperCase() + name.slice(1);

  let html = '';

  for (let i = 0; i < firstIndex; i++) html += `<div class="date inactive"></div>`;
  for (let d = 1; d <= totalDays; d++) html += `<div class="date" data-day="${d}" role="button">${d}</div>`;

  const lastIndex = firstIndex + totalDays;
  const missing = 42 - lastIndex;
  for (let i = 0; i < missing; i++) html += `<div class="date inactive"></div>`;

  datesEl.innerHTML = html;

  enableDaySelection(container);
}



function enableDaySelection(container) {
  const days = container.querySelectorAll(".date:not(.inactive)");
  days.forEach(day => {
    day.addEventListener('click', () => {
      container.querySelectorAll(".date.selected").forEach(el => el.classList.remove('selected'));
      day.classList.add('selected');
    });
  });
}



function validarDataNascimento(dateStr) {
  const [ano, mes, dia] = dateStr.split("-").map(Number);

  if (ano < 1900 || ano > 2025) return false;

  const d = new Date(ano, mes - 1, dia);
  return (
    d.getFullYear() === ano &&
    d.getMonth() + 1 === mes &&
    d.getDate() === dia
  );
}



function markAllSavedAniversarios() {
  const lista = JSON.parse(localStorage.getItem('aniversarios') || '[]');
  if (!lista.length) return;

  const grouped = {};

  lista.forEach(item => {
    if (!validarDataNascimento(item.data)) return;

    const [year, month, day] = item.data.split('-').map(Number);
    const key = `${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;

    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item.nome || "Aniversariante");
  });

  document.querySelectorAll('.calendar-card').forEach(card => {
    const month = parseInt(card.dataset.month, 10) + 1;

    card.querySelectorAll('.date[data-day]').forEach(cell => {
      const day = String(parseInt(cell.dataset.day, 10)).padStart(2,'0');
      const key = `${String(month).padStart(2,'0')}-${day}`;

      if (grouped[key]) {
        cell.classList.add('selected');
        cell.setAttribute('title', grouped[key].join(', '));

        if (!cell.querySelector('.badge')) {
          const badge = document.createElement('span');
          badge.className = 'badge bg-danger ms-1';
          badge.style.fontSize = '10px';
          badge.textContent = grouped[key].length > 1 ? grouped[key].length : '';
          cell.appendChild(badge);
        }
      }
    });
  });
}




function atualizarLista() {
  const lista = JSON.parse(localStorage.getItem("aniversarios") || "[]");
  const ul = document.getElementById("lista-aniversarios");

  if (!ul) return;

  ul.innerHTML = "";

  if (!lista.length) {
    ul.innerHTML = `<li class="list-group-item text-muted">Nenhum aniversário salvo</li>`;
    return;
  }

  lista.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";

    li.innerHTML = `
      <div>
        <strong>${item.nome}</strong><br>
        <small>${item.data.split("-").reverse().join("/")}</small>
      </div>
      <button class="btn btn-sm btn-outline-primary" onclick="abrirEdicao(${index})">
        Editar
      </button>
    `;

    ul.appendChild(li);
  });
}


let indiceEditando = null;

function abrirEdicao(indice) {
  const lista = JSON.parse(localStorage.getItem("aniversarios") || "[]");
  const item = lista[indice];

  indiceEditando = indice;

  document.getElementById("editNome").value = item.nome;
  document.getElementById("editData").value = item.data;
  document.getElementById("editLocal").value = item.local || "";
  document.getElementById("editConv").value = item.convidados || "";

  const modal = new bootstrap.Modal(document.getElementById("editarModal"));
  modal.show();
}



document.getElementById("btnSalvarEdicao")?.addEventListener("click", () => {
  const lista = JSON.parse(localStorage.getItem("aniversarios") || "[]");

  lista[indiceEditando].nome = document.getElementById("editNome").value.trim();
  lista[indiceEditando].data = document.getElementById("editData").value;
  lista[indiceEditando].local = document.getElementById("editLocal").value.trim();
  lista[indiceEditando].convidados = parseInt(document.getElementById("editConv").value);

  localStorage.setItem("aniversarios", JSON.stringify(lista));

  atualizarLista();
  markAllSavedAniversarios();

  bootstrap.Modal.getInstance(document.getElementById("editarModal")).hide();
});


document.getElementById("btnExcluir")?.addEventListener("click", () => {
  const lista = JSON.parse(localStorage.getItem("aniversarios") || "[]");

  lista.splice(indiceEditando, 1);
  localStorage.setItem("aniversarios", JSON.stringify(lista));

  atualizarLista();
  markAllSavedAniversarios();

  bootstrap.Modal.getInstance(document.getElementById("editarModal")).hide();
});

