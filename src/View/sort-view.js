import AbstractView from '../framework/view/abstract-view';
import {SORT_TYPE, SORT_TYPE_DESCRIPTION} from '../utils/consts';

const createSortItemTemplate = (sortType, currentSortType) => (`
  <div class="trip-sort__item  trip-sort__item--${sortType} ">
    <input id="${sortType}" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="${sortType}" ${(['event', 'offer' ].includes(sortType) ? 'disabled' : '')} ${((sortType === currentSortType) ? 'checked' : '')}>
    <label class="trip-sort__btn" for="${sortType}">${SORT_TYPE_DESCRIPTION[sortType]}</label>
  </div>`
);

const createSortTemplate = (currentSortType) => {
  const sortItemsTemplate = Object.keys(SORT_TYPE).map((sortType) => createSortItemTemplate(SORT_TYPE[sortType], currentSortType)).join('');
  return (`
  <form class="trip-events__trip-sort  trip-sort" action="#" method="get">
    ${sortItemsTemplate}
  </form>`
  );
};

export default class SortView extends AbstractView {

  #currentSortType;
  #onSortTypeChange;

  constructor({currentSortType, onSortTypeChange}) {
    super();
    this.#currentSortType = currentSortType;
    this.#onSortTypeChange = onSortTypeChange;
    this.element.addEventListener('change', this.#sortTypeChangeHandler);
  }

  get template() {
    return createSortTemplate(this.#currentSortType);
  }

  #sortTypeChangeHandler = (evt) => {
    evt.preventDefault();
    this.#onSortTypeChange(evt.target.value);
  };


}
