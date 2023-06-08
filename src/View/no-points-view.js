import AbstractView from '../framework/view/abstract-view';
import {FILTER_TYPE} from '../utils/consts';

const MESSAGE = {
  [FILTER_TYPE.EVERYTHING]: 'Click New Event to create your first point',
  [FILTER_TYPE.FUTURE]: 'There are no future events now',
  [FILTER_TYPE.PAST]: 'There are no past events now',
};

const createNoPointsMessageTemplate = (filterType) => `<p class="trip-events__msg">${MESSAGE[filterType]}</p>`;

export default class NoPointsView extends AbstractView {
  #filterType = null;

  constructor({filterType}) {
    super();
    this.#filterType = filterType;
  }

  get template() {
    return createNoPointsMessageTemplate(this.#filterType);
  }
}
