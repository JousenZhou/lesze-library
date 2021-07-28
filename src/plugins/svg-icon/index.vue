<template>
    <svg :class="svgClass" class="svg-icon" aria-hidden="true">
        <use :xlink:href="iconName"></use>
    </svg>
</template>

<script>
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
@Component({
    name: 'svg-icon'
})
export default class App {
    @Prop({ type: String, required: false }) iconClass;
    @Prop({ type: String, required: false }) className;
    get iconName() {
        return `#icon-${this.iconClass}`;
    }
    get svgClass() {
        return `svg-icon${this.className ? ` ${this.className}` : ''}`;
    }
}
</script>

<style lang="scss">
.svg-icon {
    width: 1em;
    height: 1em;
    vertical-align: -0.15em;
    fill: currentColor;
    overflow: hidden;
}
</style>
