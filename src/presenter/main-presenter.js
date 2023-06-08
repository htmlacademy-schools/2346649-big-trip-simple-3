import SortView from '../view/sort-view';
import NoPointsView from '../view/no-points-view';
import EventListView from '../View/events-list-view';
import LoadingView from '../View/loading-view';

import UiBlocker from '../framework/ui-blocker/ui-blocker.js';
import {RenderPosition, render, remove } from '../framework/render.js';

import PointPresenter from './point-presenter';
import NewTripPointPresenter from './new-point-presenter';

import {FILTER_TYPE, SORT_TYPE, UPDATE_TYPE, USER_ACTION} from '../utils/consts';
import {SORTS} from '../utils/consts';
import {filter} from '../utils/util';

const TIME_LIMIT = {
  LOWER_LIMIT: 350,
  UPPER_LIMIT: 1000,
};

export default class BoardPresenter {
  #boardContainer;
  #tripPointsModel;
  #destinationsModel ;
  #offersModel ;
  #filterModel ;
  #noTripPointComponent;
  #sortComponent;
  #newTripPointPresenter;
  #tripPointPresenter = new Map();
  #loadingComponent = new LoadingView();
  #tripPointsListComponent = new EventListView();
  #currentSortType = SORT_TYPE.DAY;
  #filterType = FILTER_TYPE.EVERYTHING;
  #isLoading = true;
  #uiBlocker = new UiBlocker({
    lowerLimit: TIME_LIMIT.LOWER_LIMIT,
    upperLimit: TIME_LIMIT.UPPER_LIMIT
  });

  constructor({boardContainer, tripPointsModel, destinationsModel, offersModel, filterModel, onNewTripPointDestroy}) {
    this.#boardContainer = boardContainer;
    this.#tripPointsModel = tripPointsModel;
    this.#destinationsModel = destinationsModel;
    this.#offersModel = offersModel;
    this.#filterModel = filterModel;
    this.#newTripPointPresenter = new NewTripPointPresenter({
      tripPointListContainer: this.#tripPointsListComponent.element,
      onDataChange: this.#handleViewAction,
      onDestroy: onNewTripPointDestroy
    });
    this.#tripPointsModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);

  }

  get tripPoints() {
    this.#filterType = this.#filterModel.filter;
    const tripPoints = this.#tripPointsModel.tripPoints.sort(SORTS[SORT_TYPE.TIME]);
    const filteredTripPoints = filter[this.#filterType](tripPoints);
    return (SORTS[this.#currentSortType]) ? filteredTripPoints.sort(SORTS[this.#currentSortType]) : filteredTripPoints;
  }

  get destinations() {
    return this.#destinationsModel.destinations;
  }

  get offers() {
    return this.#offersModel.offers;
  }

  init = () => {
    this.#renderBoard();
  };

  createTripPoint = () => {
    this.#currentSortType = SORT_TYPE.DAY;
    this.#filterModel.setFilter(UPDATE_TYPE.MAJOR, FILTER_TYPE.EVERYTHING);
    if(this.#noTripPointComponent) {
      remove(this.#noTripPointComponent);
    }
    this.#newTripPointPresenter.init(this.destinations, this.offers);
  };

  #handleViewAction = async (actionType, updateType, update) => {
    this.#uiBlocker.block();
    switch (actionType) {
      case USER_ACTION.ADD_TRIPPOINT:
        this.#newTripPointPresenter.setSaving();
        try {
          await this.#tripPointsModel.addTripPoint(updateType, update);
        } catch(err) {
          this.#tripPointPresenter.get(update.id).setAborting();
        }
        break;
      case USER_ACTION.UPDATE_TRIPPOINT:
        this.#tripPointPresenter.get(update.id).setSaving();
        try {
          await this.#tripPointsModel.updateTripPoint(updateType, update);
        } catch(err) {
          this.#tripPointPresenter.get(update.id).setAborting();
        }
        break;
      case USER_ACTION.DELETE_TRIPPOINT:
        this.#tripPointPresenter.get(update.id).setDeleting();
        try {
          await this.#tripPointsModel.deleteTripPoint(updateType, update);
        } catch(err) {
          this.#tripPointPresenter.get(update.id).setAborting();
        }
        break;
    }
    this.#uiBlocker.unblock();

  };

  #handleModelEvent = (updateType, data) => {
    switch(updateType) {
      case UPDATE_TYPE.PATCH:
        this.#tripPointPresenter.get(data.id).init(data, this.destinations, this.offers);
        break;
      case UPDATE_TYPE.MINOR:
        this.#clearBoard();
        this.#renderBoard();
        break;
      case UPDATE_TYPE.MAJOR:
        this.#clearBoard({resetSortType: true});
        this.#renderBoard();
        break;
      case UPDATE_TYPE.INIT:
        this.#isLoading = false;
        remove(this.#loadingComponent);
        this.#renderBoard();
        break;
    }
  };

  #renderLoading = () => {
    render(this.#loadingComponent, this.#boardContainer, RenderPosition.AFTERBEGIN);
  };

  #renderNoTripPoints = () => {
    this.#noTripPointComponent = new NoPointsView({
      filterType: this.#filterType
    });
    render(this.#noTripPointComponent, this.#boardContainer, RenderPosition.AFTERBEGIN );
  };

  #handleModeChange = () => {
    this.#newTripPointPresenter.destroy();
    this.#tripPointPresenter.forEach((presenter) => presenter.resetView());
  };


  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }
    this.#currentSortType = sortType;
    this.#clearBoard();
    this.#renderBoard();
  };

  #renderSort = () => {
    this.#sortComponent = new SortView({
      currentSortType: this.#currentSortType,
      onSortTypeChange: this.#handleSortTypeChange
    });
    render(this.#sortComponent, this.#boardContainer, RenderPosition.AFTERBEGIN);
  };

  #renderTripPoint = (tripPoint) => {
    const tripPointPresenter = new PointPresenter({
      tripPointList: this.#tripPointsListComponent.element,
      onModeChange: this.#handleModeChange,
      onDataChange: this.#handleViewAction
    });
    tripPointPresenter.init(tripPoint, this.destinations, this.offers);
    this.#tripPointPresenter.set(tripPoint.id, tripPointPresenter);
  };

  #renderTripPoints = (tripPoints) => {
    tripPoints.forEach((tripPoint) => this.#renderTripPoint(tripPoint));
  };

  #clearBoard = (resetSortType = false) => {
    this.#newTripPointPresenter.destroy();
    this.#tripPointPresenter.forEach((presenter) => presenter.destroy());
    this.#tripPointPresenter.clear();
    remove(this.#sortComponent);
    remove(this.#loadingComponent);
    if(this.#noTripPointComponent) {
      remove(this.#noTripPointComponent);
    }
    if (resetSortType) {
      this.#currentSortType = SORT_TYPE.DAY;
    }
  };

  #renderBoard = () => {
    if(this.#isLoading) {
      this.#renderLoading();
      return;
    }
    const tripPoints = this.tripPoints;
    if (tripPoints.length === 0) {
      this.#renderNoTripPoints();
      return;
    }
    this.#renderSort();
    render(this.#tripPointsListComponent, this.#boardContainer);
    this.#renderTripPoints(tripPoints);
  };
}
