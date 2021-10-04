export default class ColumnChart {
  constructor(data = {}) {
    this.data = data.data || [];
    this.label = data.label;
    this.value = data.value;
    this.link = data.link;
    this.formatHeading = data.formatHeading || ((heading) => heading);
    this.chartHeight = 50;
    this.maxValue = Math.max(...this.data);

    this.render();
  }

  template = ({link, chart}) => `
    <div class="column-chart__title">
      Total ${this.label}
      ${link}
    </div>
    <div class="column-chart__container">
      <div data-element="header" class="column-chart__header">${this.formatHeading(this.value)}</div>
      <div data-element="body" class="column-chart__chart">
        ${chart}
      </div>
    </div>
  `;
  linkTemplate = (href) => `<a class="column-chart__link" href="${href}">View all</a>`;
  chartItemTemplate = ({height, value}) => `<div style="--value: ${height}" data-tooltip="${value}"></div>`;

  builder() {
    let chart = '';
    for (const item of this.data) {
      chart += this.chartItemTemplate({
        height: String(Math.floor(item * (this.chartHeight / this.maxValue))),
        value: (item / this.maxValue * 100).toFixed(0) + '%',
      });
    }
    return this.template({
      link: this.link ? this.linkTemplate(this.link) : '',
      chart,
    });
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.classList.add('column-chart');
    if (!this.data.length) wrapper.classList.add('column-chart_loading');
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
