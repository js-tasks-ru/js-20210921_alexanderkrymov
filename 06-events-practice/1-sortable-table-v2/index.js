export default class SortableTable {
  onClick = (e) => {
    const element = e.target.dataset.sortable ? e.target : e.target.closest('[data-sortable="true"]');
    console.log('click', element.id);
    const order = element.dataset.order === 'desc' ? 'asc' : 'desc';
    this.sort(element.dataset.id, order);
  }
  constructor(headersConfig, {
    data = [],
    sorted = {},
    isSortLocally = true,
  } = {}) {
    this.headersConfig = headersConfig;
    this.data = data;
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;

    this.sort();
  }

  get template() {
    return `
      <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">

          ${this.header}

          ${this.body}

          <div data-element="loading" class="loading-line sortable-table__loading-line"></div>

          <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
            <div>
              <p>No products satisfies your filter criteria</p>
              <button type="button" class="button-primary-outline">Reset all filters</button>
            </div>
          </div>

        </div>
      </div>
    `;
  }

  get arrowTemplate() {
    return `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    `;
  }

  getHeaderCell({id = '', title = '', sortable = false, order = false} = {}) {
    return `
      <div class="sortable-table__cell" id="${id}" data-id="${id}" data-sortable="${sortable}"
        ${order ? `data-order="${order}"` : ''}>
        <span>${title}</span>
        ${order ? this.arrowTemplate : ''}
      </div>
    `;
  }

  createHeader() {
    const headerCells = this.headersConfig.map((item) => this.getHeaderCell(item));
    this.header = `
      <div data-element="header" class="sortable-table__header sortable-table__row">${headerCells.join('')}</div>
    `;
  }

  getDefaultCellTemplate(value) {
    return `
      <div class="sortable-table__cell">${value}</div>
    `;
  }

  getRow(cells) {
    return `<a href="/products/3d-ochki-epson-elpgs03" class="sortable-table__row">${cells}</a>`;
  }

  createBody() {
    const rows = this.data.map((dataItem) => {
      const cells = [];
      this.headersConfig.forEach((item) => {
        const value = dataItem[item.id];
        const cell = item.template ? item.template(value) : this.getDefaultCellTemplate(value);
        cells.push(cell);
      });
      return this.getRow(cells.join(''));
    });
    this.body = `<div data-element="body" class="sortable-table__body">${rows.join('')}</div>`;
  }

  toHTML(htmlString) {
    const htmlObject = document.createElement('div');
    htmlObject.innerHTML = htmlString;
    return htmlObject.firstElementChild;
  }

  sortFunctions = {
    string: (arr, key, order = 'asc') => {
      arr.sort((a, b) => {
        let result = a[key].localeCompare(b[key], ['ru-RU', 'es-US'], {
          localeMatcher: 'lookup',
          caseFirst: 'upper',
        });
        if (order === 'desc') result *= -1;
        return result;
      });
    },
    number: (arr, key, order = 'asc') => {
      arr.sort((a, b) => {
        let result = a[key] - b[key];
        if (order === 'desc') result *= -1;
        return result;
      });
    },
    date: (arr, key, order = 'asc') => {
      arr.sort((a, b) => {
        let result = new Date(b[key]) - new Date(a[key]);
        if (order === 'desc') result *= -1;
        return result;
      });
    }
  }

  getSubElements(root) {
    const subElements = {};
    [...root.querySelectorAll('[data-element]')].forEach((el) => {
      subElements[el.dataset.element] = el;
    });
    return subElements;
  }

  render() {
    this.createHeader();
    this.createBody();

    this.lastElement = this.element;
    this.element = this.toHTML(this.template);

    if (this.lastElement) this.lastElement.replaceWith(this.element);

    this.subElements = this.getSubElements(this.element);
    this.addEventListeners();
    console.log('dfsdfas', this.subElements.header.children.price.dataset.order);
  }

  addEventListeners() {
    [...this.subElements.header.querySelectorAll('[data-sortable="true"]')].forEach((el) => {
      el.addEventListener('pointerdown', this.onClick);
    });
  }
  removeEventListeners() {
    [...this.subElements.header.querySelectorAll('[data-sortable="true"]')].forEach((el) => {
      el.removeEventListener('pointerdown', this.onClick);
    });
  }

  sort (field = this.sorted.id, order = this.sorted.order) {
    if (this.isSortLocally) {
      this.sortOnClient(field, order);
    } else {
      this.sortOnServer(field, order);
    }
  }

  sortOnClient(field, order) {
    let sortType = '';

    this.headersConfig.forEach((el) => {
      if (el.id === field) {
        el.order = order;
        console.log('sort', el.order);
        sortType = el.sortType;
      } else {
        el.order = false;
      }
    });

    if (!sortType) return;

    this.sortFunctions[sortType](this.data, field, order);

    this.render();
  }

  sortOnServer(field, order) {}

  remove() {
    if (this.element) this.element.remove();
    this.element = null;
  }

  destroy() {
    this.remove();
    this.removeEventListeners();
  }
}
