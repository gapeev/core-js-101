/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */


/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  this.width = width;
  this.height = height;
  this.getArea = function getArea() {
    return this.width * this.height;
  };
}


/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  const obj = JSON.parse(json);
  Object.setPrototypeOf(obj, proto);
  return obj;
}


/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

class Selector {
  constructor() {
    this.state = {
      element: null,
      id: null,
      classes: [],
      attrs: [],
      pseudoClasses: [],
      pseudoElement: null,
      combinator: null,
      linkedSelector: null,
    };
    this.availableProps = ['element', 'id', 'classes', 'attrs', 'pseudoClasses', 'pseudoElement', 'combinator', 'linkedSelector'];
    this.onceProps = ['element', 'id', 'pseudoElement', 'combinator', 'linkedSelector'];
  }

  setProp(propName, value) {
    const isPropAvailable = this.availableProps.includes(propName);
    if (!isPropAvailable) {
      throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    }

    const isPropOnce = this.onceProps.includes(propName);
    if (isPropOnce && this.state[propName] !== null) {
      throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }

    const propIndex = this.availableProps.indexOf(propName);
    if (propIndex !== -1) {
      this.availableProps = this.availableProps.slice(propIndex);
    }

    if (isPropOnce) {
      this.state[propName] = value;
    } else {
      this.state[propName].push(value);
    }
  }

  element(value) {
    this.setProp('element', value);
    return this;
  }

  id(value) {
    this.setProp('id', value);
    return this;
  }

  class(value) {
    this.setProp('classes', value);
    return this;
  }

  attr(value) {
    this.setProp('attrs', value);
    return this;
  }

  pseudoClass(value) {
    this.setProp('pseudoClasses', value);
    return this;
  }

  pseudoElement(value) {
    this.setProp('pseudoElement', value);
    return this;
  }

  combine(combinator, linkedSelector) {
    this.setProp('combinator', combinator);
    this.setProp('linkedSelector', linkedSelector);
    return this;
  }

  stringify() {
    const {
      element, id, classes, attrs, pseudoClasses, pseudoElement, combinator, linkedSelector,
    } = this.state;

    const elementToString = element === null ? '' : element;
    const idToString = id === null ? '' : `#${id}`;
    const classesToString = classes.map((cssClass) => `.${cssClass}`).join('');
    const attrsToString = attrs.map((attr) => `[${attr}]`).join('');
    const pseudoClassesToString = pseudoClasses.map((pseudoClass) => `:${pseudoClass}`).join('');
    const pseudoElementToString = pseudoElement === null ? '' : `::${pseudoElement}`;
    const linkedSelectorToString = linkedSelector === null ? '' : ` ${combinator} ${linkedSelector.stringify()}`;

    return `${elementToString}${idToString}${classesToString}${attrsToString}${pseudoClassesToString}${pseudoElementToString}${linkedSelectorToString}`;
  }
}

const cssSelectorBuilder = {
  element(value) {
    const selector = new Selector();
    selector.element(value);
    return selector;
  },

  id(value) {
    const selector = new Selector();
    selector.id(value);
    return selector;
  },

  class(value) {
    const selector = new Selector();
    selector.class(value);
    return selector;
  },

  attr(value) {
    const selector = new Selector();
    selector.attr(value);
    return selector;
  },

  pseudoClass(value) {
    const selector = new Selector();
    selector.pseudoClass(value);
    return selector;
  },

  pseudoElement(value) {
    const selector = new Selector();
    selector.pseudoElement(value);
    return selector;
  },

  combine(selector1, combinator, selector2) {
    return selector1.combine(combinator, selector2);
  },
};


module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
