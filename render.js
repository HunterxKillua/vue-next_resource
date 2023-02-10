"use strict";
const vdom = {
  tag: 'div',
  props: {
    onClick: () => console.log('click event')
  },
  id: 'root',
  className: 'layout-container',
  children: [
    {
      tag: 'span',
      children: '子元素内容',
      props: {
        onClick: (event) => {
          event.stopPropagation();
          console.log('子元素事件');
        }
      }
    },
    {
      tag: function() {
        return {
          tag: 'div',
          props: {
            onclick: (event) => {
              event.stopPropagation();
              console.log('组件事件');
            }
          },
          children: '组件渲染'
        }
      }
    }
  ]
}

const renderElement = (vnode, container) => {
  if (typeof vnode.tag === 'function') {
    renderComponent(vnode.tag(), container);
  } else {
    const ele = document.createElement(vnode.tag);
    ele.id = vnode?.id || '';
    ele.className = vnode?.className || 'box';
    if (vnode?.props) {
      for(const key in vnode.props) {
        ele.addEventListener(key.substring(2).toLocaleLowerCase(), vnode.props[key]);
      }
    }
    if (typeof vnode.children === 'string') {
      ele.appendChild(document.createTextNode(vnode.children));
    } else if(Array.isArray(vnode.children)) {
      vnode.children.forEach(element => {
        renderElement(element, ele)
      });
    }
    container.appendChild(ele)
  }
}

const renderComponent = (vnode, container) => renderElement(vnode, container)
