/**
 * @Description: 挂载载体
 * @author BloodCat(JousenZhou)
 * @date 2020/11/27
 */
import Vue from 'vue';
export default async function(components, parameter, callback) {
    let constructor = Vue.extend(components);
    let instance = new constructor({});
    instance.vm = instance.$mount();
    document.body.appendChild(instance.vm.$el);
    instance.vm.visible = true;
    instance.dom = instance.vm.$el;
    const destroy = () => {
        instance.$destroy(true);
        instance = null;
        constructor = null;
    };
    await instance.$view(parameter, callback, destroy);
}
