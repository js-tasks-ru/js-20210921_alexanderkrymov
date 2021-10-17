import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  onClick = async (event) => {
    const element = event.target.closest('[data-sortable="true"]');
    const order = this.toggleOrder(element.dataset.order);
    element.dataset.order = order;
    element.append(this.subElements.arrow);
    await this.sort(element.dataset.id, order);
    this.sorted.id = element.dataset.id;
    this.sorted.order = order;
  }
  onScroll = () => {
    const tableHeight = this.element.scrollHeight + this.element.offsetTop;
    const scrollSize = document.documentElement.clientHeight + window.pageYOffset;
    if (scrollSize >= tableHeight - 100 && !this.isLoading) {
      this.loadMore();
    }
  }

  isLoading = false;
  start = 0;
  end = 30;
  step = 30;
  offset = this.step;

  constructor(headersConfig, {
    data = [],
    url = '',
    sorted = {
      id: headersConfig.find((el) => el.sortable).id,
      order: 'asc',
    },
    isSortLocally = false,
  } = {}) {
    this.headersConfig = headersConfig;
    this.data = data;
    this.url = url;
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;

    this.render();
  }

  async render() {
    const table = this.toHTML(this.getTemplate());

    if (this.element) this.element.innerHtml = table.innerHtml;
    else this.element = table;

    this.subElements = this.getSubElements(this.element);
    this.addEventListeners();

    await this.sort(this.sorted.id, this.sorted.order);
  }

  getTemplate() {
    return `
      <div class="sortable-table">
        ${this.getHeader()}
        ${this.getBody()}
        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
          <div>
            <p>No products satisfies your filter criteria</p>
            <button type="button" class="button-primary-outline">Reset all filters</button>
          </div>
        </div>
      </div>
    `;
  }

  getHeader() {
    const headerCells = this.headersConfig.map((item) => this.getHeaderCell(item));
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">${headerCells.join('')}</div>
    `;
  }

  getHeaderCell({id = '', title = '', sortable = false} = {}) {
    const arrow = this.sorted.id === id ? this.getArrow() : '';
    return `
      <div class="sortable-table__cell" id="${id}" data-id="${id}" data-sortable="${sortable}" data-order="${this.sorted.order}">
        <span>${title}</span>
        ${arrow}
      </div>
    `;
  }

  getDefaultCellTemplate(value) {
    return `
      <div class="sortable-table__cell">${value}</div>
    `;
  }

  getBody() {
    return `<div data-element="body" class="sortable-table__body">${this.getRows().join('')}</div>`;
  }

  getRows(data = []) {
    return data.map((dataItem) => {
      const cells = this.headersConfig.map((item) => {
        const value = dataItem[item.id];
        const cell = item.template ? item.template(value) : this.getDefaultCellTemplate(value);
        return cell;
      });
      return this.getRow(cells.join(''));
    });
  }

  getRow(cells) {
    return `<a href="/products/3d-ochki-epson-elpgs03" class="sortable-table__row">${cells}</a>`;
  }

  async sort (field = this.sorted.id, order = this.sorted.order) {
    let data = this.isSortLocally ? this.sortOnClient(field, order) : await this.sortOnServer(field, order);
    if (this.subElements && this.subElements.body) this.subElements.body.innerHTML = this.getRows(data).join('');
  }

  sortOnClient(id, order) {
    let sortType = '';

    this.headersConfig.forEach((el) => {
      if (el.id === id) {
        el.order = order;
        sortType = el.sortType;
      } else {
        el.order = false;
      }
    });

    if (!sortType) return;

    return this.sortFunctions[sortType](this.data, id, order);
  }

  sortFunctions = {
    string: (arr, key, order = 'asc') => {
      return arr.sort((a, b) => {
        let result = a[key].localeCompare(b[key], ['ru-RU', 'es-US'], {
          localeMatcher: 'lookup',
          caseFirst: 'upper',
        });
        if (order === 'desc') result *= -1;
        return result;
      });
    },
    number: (arr, key, order = 'asc') => {
      return arr.sort((a, b) => {
        let result = a[key] - b[key];
        if (order === 'desc') result *= -1;
        return result;
      });
    },
    date: (arr, key, order = 'asc') => {
      return arr.sort((a, b) => {
        let result = new Date(b[key]) - new Date(a[key]);
        if (order === 'desc') result *= -1;
        return result;
      });
    }
  }

  async sortOnServer(id, order) {
    return await this.loadData(id, order);
  }

  async loadData(id, order, start = this.start, end = this.end) {
    this.addLoader();
    const params = new URLSearchParams({
      _embed: 'subcategory.category',
      _sort: id,
      _order: order,
      _start: start,
      _end: end
    });

    try {
      const response = await fetch(`${BACKEND_URL}/${this.url}?${params}`);
      const data = await response.json();
      this.removeLoader();
      return data;
    } catch (error) {
      console.error('loadData', error);
    }
  }

  getArrow() {
    return `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    `;
  }

  toHTML(htmlString) {
    const htmlObject = document.createElement('div');
    htmlObject.innerHTML = htmlString;
    return htmlObject.firstElementChild;
  }

  toggleOrder(order) {
    const orders = {
      asc: 'desc',
      desc: 'asc'
    };

    return orders[order] || 'desc';
  }

  getSubElements(root) {
    const subElements = {};
    [...root.querySelectorAll('[data-element]')].forEach((el) => {
      subElements[el.dataset.element] = el;
    });
    return subElements;
  }

  addEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onClick);
    document.addEventListener('scroll', this.onScroll);
  }
  removeEventListeners() {
    [...this.subElements.header.querySelectorAll('[data-sortable="true"]')].forEach((el) => {
      el.removeEventListener('pointerdown', this.onClick);
    });
  }

  async loadMore() {
    const start = this.offset;
    const end = this.offset + this.step;
    const data = await this.loadData(this.sorted.id, this.sorted.order, start, end);

    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getRows(data);
    this.subElements.body.append(...wrapper.children);

    this.offset = end;
  }

  addLoader() {
    this.isLoading = true;
    this.element.classList.add('sortable-table_loading');
  }

  removeLoader() {
    this.isLoading = false;
    this.element.classList.remove('sortable-table_loading');
  }

  remove() {
    if (this.element) this.element.remove();
    this.element = null;
  }

  destroy() {
    this.remove();
    this.removeEventListeners();
  }
}
