(function () {
  "use strict";

  const data = window.LUTRA_DATA;
  const missingList = document.getElementById("missing-list");
  const availableList = document.getElementById("available-list");
  const searchInput = document.getElementById("sticker-search");
  const searchResult = document.getElementById("search-result");
  const missingEmpty = document.getElementById("missing-empty");
  const availableEmpty = document.getElementById("available-empty");

  const availableEntries = Object.entries(data.available)
    .map(([number, count]) => [Number(number), count])
    .sort((a, b) => a[0] - b[0]);

  document.getElementById("missing-count").textContent = data.missing.length;
  document.getElementById("available-types").textContent = availableEntries.length;
  document.getElementById("available-total").textContent = availableEntries
    .reduce((sum, [, count]) => sum + count, 0);
  document.getElementById("last-updated").textContent = new Intl.DateTimeFormat("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(new Date(`${data.updated}T12:00:00`));

  function missingItem(number) {
    const item = document.createElement("li");
    item.className = "sticker sticker-missing";
    item.dataset.number = String(number);
    item.setAttribute("aria-label", `${number}-es matrica: hiányzik`);
    item.textContent = number;
    return item;
  }

  function availableItem(number, count) {
    const item = document.createElement("li");
    item.className = "sticker sticker-available";
    item.dataset.number = String(number);
    item.setAttribute("aria-label", `${number}-es matrica: ${count} darab cserélhető`);

    const numberText = document.createElement("span");
    numberText.textContent = number;
    const countText = document.createElement("span");
    countText.className = "quantity";
    countText.textContent = `×${count}`;
    countText.setAttribute("aria-hidden", "true");

    item.append(numberText, countText);
    return item;
  }

  data.missing.forEach((number) => missingList.appendChild(missingItem(number)));
  availableEntries.forEach(([number, count]) => availableList.appendChild(availableItem(number, count)));

  function setVisibility(list, query) {
    let visibleCount = 0;
    list.querySelectorAll(".sticker").forEach((item) => {
      const visible = !query || item.dataset.number.includes(query);
      item.hidden = !visible;
      if (visible) visibleCount += 1;
    });
    return visibleCount;
  }

  function updateSearch() {
    const query = searchInput.value.replace(/\D/g, "");
    if (query !== searchInput.value) searchInput.value = query;

    const visibleMissing = setVisibility(missingList, query);
    const visibleAvailable = setVisibility(availableList, query);
    missingEmpty.hidden = visibleMissing > 0;
    availableEmpty.hidden = visibleAvailable > 0;

    if (!query) {
      searchResult.textContent = "";
      return;
    }

    const exactNumber = Number(query);
    const isMissing = data.missing.includes(exactNumber);
    const availableCount = data.available[exactNumber];

    if (isMissing) {
      searchResult.textContent = `A ${exactNumber}-es matricát keressük.`;
      searchResult.dataset.state = "missing";
    } else if (availableCount) {
      searchResult.textContent = `A ${exactNumber}-esből ${availableCount} darabot tudunk cserére adni.`;
      searchResult.dataset.state = "available";
    } else {
      searchResult.textContent = `A ${exactNumber}-es jelenleg nincs a csere-listán.`;
      searchResult.dataset.state = "neutral";
    }
  }

  searchInput.addEventListener("input", updateSearch);
})();
