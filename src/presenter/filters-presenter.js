import {render, replace, remove} from '../framework/render.js';
import FilterView from '../view/filter-view.js';
import {FILTER_TYPE, FILTER_TYPE_DESCRIPTION, UPDATE_TYPE} from '../utils/consts';
import {filter} from '../utils/util';

export default class FilterPresenter {
  #filterContainer;
  #filterModel;
  #tripPointsModel;
  #filterComponent;

  constructor(filterContainer, filterModel, tripPointsModel) {
    this.#filterContainer = filterContainer;
    this.#filterModel = filterModel;
    this.#tripPointsModel = tripPointsModel;

    this.#tripPointsModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);
  }

  get filters() {
    return [FILTER_TYPE.EVERYTHING, FILTER_TYPE.FUTURE, FILTER_TYPE.PAST].map((type) => ({ type, name: FILTER_TYPE_DESCRIPTION[type], count: filter[type](this.#tripPointsModel.tripPoints).length}));
  }

  init = () => {
    const filters = this.filters;
    const prevFilterComponent = this.#filterComponent;

    this.#filterComponent = new FilterView({
      filters,
      currentFilterType: this.#filterModel.filter,
      onFilterTypeChange: this.#handleFilterTypeChange
    });

    if (!prevFilterComponent) {
      render(this.#filterComponent, this.#filterContainer);
      return;
    }

    replace(this.#filterComponent, prevFilterComponent);
    remove(prevFilterComponent);
  };

  #handleModelEvent = () => {
    this.init();
  };

  #handleFilterTypeChange = (filterType) => {
    if (this.#filterModel.filter === filterType) {
      return;
    }

    this.#filterModel.setFilter(UPDATE_TYPE.MAJOR, filterType);
  };
}
