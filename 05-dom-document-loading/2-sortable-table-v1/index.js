export default class SortableTable {

  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data.data ? data.data : data;

    this.render();
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
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}"
        ${order ? `data-order="${order}"` : ''}>
        <span>${title}</span>
        ${order ? this.arrowTemplate : ''}
      </div>
    `;
  }

  createHeader() {
    const headerCells = this.headerConfig.map((item) => this.getHeaderCell(item));
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
      this.headerConfig.forEach((item) => {
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
    console.log(subElements);
    return subElements;
  }

  render() {
    this.createHeader();
    this.createBody();

    this.lastElement = this.element;
    this.element = this.toHTML(this.template);

    if (this.lastElement) this.lastElement.replaceWith(this.element);

    this.subElements = this.getSubElements(this.element);
  }

  sort(field, order) {
    let sortType = '';

    this.headerConfig.forEach((el) => {
      if (el.id === field) {
        el.order = order;
        sortType = el.sortType;
      } else {
        el.order = false;
      }
    });

    if (!sortType) return;

    this.sortFunctions[sortType](this.data, field, order);

    this.render();
  }

  remove() {
    if (this.element) this.element.remove();
    this.element = null;
  }

  destroy() {
    this.remove();
  }
}
