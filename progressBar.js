export class ProgressBar {
  constructor(GLOBALS) {
    let canvas = GLOBALS.CANVAS.ref
    this.canvas = canvas;
    this.ctx = GLOBALS.CANVAS.ctx
    this.x = canvas.width * 0.3 / 2;
    this.y = canvas.height * 0.5 / 2;
    this.width = canvas.width * 0.7;
    this.height = canvas.height * 0.5;

    this.max = 100;
    this.value = 0;
    this.bgColor = 'white';
    this.color = 'red';
    this.text = 'Loading assets...';
  }

  updateValue(value, outOf) {
    this.value = value * this.max / outOf;
    console.log('bar updated');
  }

  draw() {
    let ctx = this.ctx;
    ctx.fillStyle = this.bgColor;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width / this.max * this.value, this.height);
  }
}