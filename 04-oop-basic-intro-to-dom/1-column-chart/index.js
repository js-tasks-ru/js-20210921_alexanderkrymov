export default class ColumnChart {
  constructor({
    data = [],
    label = '',
    link = '',
    value = 0,
    formatHeading = heading => heading
  } = {}) {
    this.data = data;
    this.label = label;
    this.value = value;
    this.link = link;
    this.formatHeading = formatHeading;
    this.chartHeight = 50;
    this.maxValue = Math.max(...this.data);

    this.render();
  }

  get template() {
    return `
    <div class="column-chart__title">
      Total ${this.label}
      ${this.link}
    </div>
    <div class="column-chart__container">
      <div data-element="header" class="column-chart__header">${this.formatHeading(this.value)}</div>
      <div data-element="body" class="column-chart__chart">
        ${this.chart}
      </div>
    </div>
  `;}

  createLink = (href) => `<a class="column-chart__link" href="${href}">View all</a>`;
  createChartItem = ({height, value}) => `<div style="--value: ${height}" data-tooltip="${value}"></div>`;

  builder() {
    this.chart = this.data.map((item) => {
      return this.createChartItem({
        height: String(Math.floor(item * (this.chartHeight / this.maxValue))),
        value: (item / this.maxValue * 100).toFixed(0) + '%',
      });
    }).join('');
    this.link = this.link ? this.createLink(this.link) : '';
    return this.template;
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.classList.add('column-chart');
    if (!this.data.length) {wrapper.classList.add('column-chart_loading');}
    wrapper.style.setProperty('--chart-height', this.chartHeight);
    wrapper.innerHTML = this.builder();

    this.element = wrapper;
  }

  update(data = []) {
    this.data = data;
    this.render();
  }

  remove() {
    this.element = null;
  }

  destroy() {
    this.remove();
  }
}
