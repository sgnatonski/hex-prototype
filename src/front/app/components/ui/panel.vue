<template>
  <div class="panel">
    <div class="corner_dbl_tl">
      <div></div>
    </div>
    <div class="line_dbl_h1">
      <div></div>
    </div>
    <div class="corner_dbl_tr">
      <div></div>
    </div>
    <div class="line_dbl_v1">
      <div></div>
    </div>
    <div class="slot">
      <slot></slot>
    </div>
    <div class="line_dbl_v2">
      <div></div>
    </div>
    <div class="corner_dbl_bl">
      <div></div>
    </div>
    <div class="line_dbl_h2">
      <div></div>
    </div>
    <div class="corner_dbl_br">
      <div></div>
    </div>
  </div>
</template>

<style>
.panel {
  display: grid;
  grid-template-columns: 25px auto 25px;
  grid-template-rows: 25px auto 25px;
  grid-column-gap: 0px;
  grid-row-gap: 0px;
  justify-items: stretch;
  align-items: stretch;
  margin: 8px;
}

.panel > .slot {
  background-color: #a59e95;
  margin: -10px;
  padding: 10px;
  box-shadow: black -22px 22px 22px 0px;
}

.panel h1 {
  font-weight: normal;
  font-size: 2em;
  text-shadow: 1px 2px 2px #ccc;
  margin-top: 0px;
}

.panel h2 {
  font-weight: normal;
  font-size: 1.5em;
  text-shadow: 1px 2px 2px #ccc;
  margin-top: 0px;
}

.panel h1:first-letter {
  font-family: SquareCaps;
  font-size: 2em;
  text-shadow: 2px 2px 0px #e6e2d2;
}
.panel h2:first-letter {
  font-family: SquareCaps;
  font-size: 1.5em;
  text-shadow: 2px 2px 0px #e6e2d2;
}

.panel div.right-aligned {
  position: absolute;
  top: 20px;
  right: 30px;
  width: auto;
}

.line_dbl_v1 {
  z-index: 1;
  background: url(styles/line_dbl_v.png) repeat-y;
  height: 100%;
  margin-left: 1px;
}

.line_dbl_h1 {
  background: url(styles/line_dbl_h.png) repeat-x;
  width: 100%;
  margin-top: 1px;
}

.line_dbl_h2 {
  background: url(styles/line_dbl_h.png) repeat-x;
  width: 100%;
  margin-top: 7px;
}

.line_dbl_v2 {
  z-index: 1;
  background: url(styles/line_dbl_v.png) repeat-y;
  height: 100%;
  margin-left: 7px;
}
</style>