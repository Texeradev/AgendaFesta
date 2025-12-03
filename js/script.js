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
  console.log("Aniversários no localStorage:", lista);

  if (!lista.length) return;

  const grouped = {};

  
  lista.forEach(item => {
    if (!validarDataNascimento(item.data)) return;

    const [year, month, day] = item.data.split('-').map(Number);
    const key = `${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;

    if (!grouped[key]) grouped[key] = [];

    grouped[key].push({
      nome: item.nome || "Aniversariante",
      local: item.local || "Local não informado",
      convidados: item.convidados || 0
    });
  });

  
  document.querySelectorAll('.calendar-card').forEach(card => {
    const month = parseInt(card.dataset.month, 10) + 1; 
    const year = card.dataset.year ? parseInt(card.dataset.year, 10) : new Date().getFullYear();

    card.querySelectorAll('.date[data-day]').forEach(cell => {
      const day = String(parseInt(cell.dataset.day, 10)).padStart(2,'0');
      const key = `${String(month).padStart(2,'0')}-${day}`;

      if (grouped[key]) {
        cell.classList.add('selected');

        let tooltip = grouped[key]
          .map(p => `${p.nome}\nLocal: ${p.local}\nConvidados: ${p.convidados}`)
          .join('\n\n');

        cell.setAttribute('title', tooltip);

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
