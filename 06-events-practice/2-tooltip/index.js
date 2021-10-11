class Tooltip {
  static instance;

  onPointerOver = (e) => {
    if (!e.target.dataset.tooltip) return;
    this.render(e.target.dataset.tooltip);
    e.target.addEventListener('pointermove', this.onPointerMove);
  }

  onPointerOut = (e) => {
    if (!e.target.dataset.tooltip) return;
    this.remove();
    e.target.removeEventListener('pointermove', this.onPointerMove);
  }

  onPointerMove = (e) => {
    this.element.style.top = `${e.y + 10}px`;
    this.element.style.left = `${e.x + 10}px`;
  }

  constructor () {
    if (Tooltip.instance) return Tooltip.instance;
    Tooltip.instance = this;
    return Tooltip.instance;
  }

  getTemplate(message) {
    return `<div class="tooltip">${message}</div>`;
  }

  toHTML(htmlString) {
    const htmlObject = document.createElement('div');
    htmlObject.innerHTML = htmlString;
    return htmlObject.firstElementChild;
  }

  initialize() {
    this.addEventListeners();
  }

  render(message = '') {
    this.element = this.toHTML(this.getTemplate(message));
    document.body.append(this.element);
  }

  addEventListeners() {
    document.addEventListener('pointerover', this.onPointerOver);
    document.addEventListener('pointerout', this.onPointerOut);
  }

  removeEventListeners() {
    document.removeEventListener('pointerover', this.onPointerOver);
    document.removeEventListener('pointerout', this.onPointerOut);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.removeEventListeners();
  }
}

export default Tooltip;
