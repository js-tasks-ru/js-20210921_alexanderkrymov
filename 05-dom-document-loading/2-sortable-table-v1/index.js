export default class SortableTable {

  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data.data ? data.data : data;

    this.render();
  }

  get _template() {
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

  get _arrowTemplate() {
    return `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    `;
  }

  _getHeaderCell({id = '', title = '', sortable = false, order = false} = {}) {
    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}"
        ${order ? `data-order="${order}"` : ''}>
        <span>${title}</span>
        ${order ? this._arrowTemplate : ''}
      </div>
    `;
  }

  _createHeader() {
    const headerCells = [];
    this.headerConfig.forEach((item) => {
      headerCells.push(this._getHeaderCell(item));
    });
    this.header = `
      <div data-element="header" class="sortable-table__header sortable-table__row">${headerCells.join('')}</div>
    `;
  }

  _getDefaultCellTemplate(value) {
    return `
      <div class="sortable-table__cell">${value}</div>
    `;
  }

  _getRow(cells) {
    return `<a href="/products/3d-ochki-epson-elpgs03" class="sortable-table__row">${cells}</a>`;
  }

  _createBody() {
    const rows = [];
    this.data.forEach((dataItem) => {
      const cells = [];
      this.headerConfig.forEach((item) => {
        const value = dataItem[item.id];
        const cell = item.template ? item.template(value) : this._getDefaultCellTemplate(value);
        cells.push(cell);
      });
      rows.push(this._getRow(cells.join('')));
    });
    this.body = `<div data-element="body" class="sortable-table__body">${rows.join('')}</div>`;
  }

  _toHTML(htmlString) {
    const htmlObject = document.createElement('div');
    htmlObject.innerHTML = htmlString;
    return htmlObject.firstElementChild;
  }

  _sortFunctions = {
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

  get subElements() {
    return {
      header: this._toHTML(this.header),
      body: this._toHTML(this.body),
    };
  }

  render() {
    const wrapper = document.createElement('div');
    this._createHeader();
    this._createBody();

    this.lastElement = this.element;

    this.element = this._toHTML(this._template);

    if (this.lastElement) this.lastElement.replaceWith(this.element);
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

    this._sortFunctions[sortType](this.data, field, order);

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
