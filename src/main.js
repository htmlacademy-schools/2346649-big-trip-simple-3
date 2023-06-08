import BoardPresenter from './presenter/main-presenter';
import FilterPresenter from './presenter/filters-presenter';
import TripPointModel from './model/model-trip-point';
import ModelDestinations from './model/model-destination';
import ModelOffers from './model/model-offer';
import ModelFilters from './model/model-filter';

import {render} from './framework/render.js';
import NewTripPointButtonView from './View/point-button-view';

import ApiServer from './api-server/server';

const AUTHORIZATION = 'Basic kekw';
const END_POINT = 'https://18.ecmascript.pages.academy/big-trip';

const boardContainer = document.querySelector('.trip-events');
const siteFilterElement = document.querySelector('.trip-controls__filters');
const siteHeaderElement = document.querySelector('.trip-main');

const tripPointApiService = new ApiServer(END_POINT, AUTHORIZATION);

const tripPointsModel = new TripPointModel(tripPointApiService);
const destinationsModel = new ModelDestinations(tripPointApiService);
const offersModel = new ModelOffers(tripPointApiService);
const filterModel = new ModelFilters();

const newTripPointButtonComponent = new NewTripPointButtonView({
  onClick: handleNewTripPointButtonClick
});

const boardPresenter = new BoardPresenter({
  boardContainer,
  tripPointsModel,
  destinationsModel,
  offersModel,
  filterModel,
  onNewTripPointDestroy
});

const filterPresenter = new FilterPresenter(
  siteFilterElement,
  filterModel,
  tripPointsModel
);


function handleNewTripPointButtonClick() {
  boardPresenter.createTripPoint();
  newTripPointButtonComponent.element.disabled = true;
}

function onNewTripPointDestroy() {
  newTripPointButtonComponent.element.disabled = false;
}

filterPresenter.init();
boardPresenter.init();
tripPointsModel.init()
  .finally(() => {
    render(newTripPointButtonComponent, siteHeaderElement);
  });
