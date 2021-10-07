export default class NotificationMessage {
  constructor(message = '', {duration = 1000, type = 'success'} = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;

    this.render();
  }

  get template() {
    return `
      <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this.type}</div>
          <div class="notification-body">
            ${this.message}
          </div>
        </div>
      </div>
    `;
  }

  timer() {
    setTimeout(() => {
      this.destroy();
    }, this.duration);
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;
  }

  show(target = document.body) {
    if (NotificationMessage.currentNotification) NotificationMessage.currentNotification.destroy();
    target.append(this.element);
    clearTimeout(NotificationMessage.timer);
    NotificationMessage.timer = this.timer();
    NotificationMessage.currentNotification = this;
  }

  remove() {
    if (this.element) this.element.remove();
    this.element = null;
  }

  destroy() {
    this.remove();
    NotificationMessage.currentNotification = null;
  }
}
