import {render} from './framework/render.js';
import TripPointModel from './model/model-trip-point';
import {ApiServer} from './api-server/server';
import ModelOffer from './model/model-offer';
import ModelDestinations from './model/model-destination';
import ModelFilters from './model/model-filter';
import MainPresenter from './presenter/main-presenter';
import FilterPresenter from './presenter/filters-presenter';
import CreateTripEventButton from './View/point-button-view';


const filterContainer = document.querySelector('.trip-controls__filters');
const tripEventsSection = document.querySelector('.trip-events');
const headerBlock = document.querySelector('.trip-main');

const AUTHORIZATION = 'Basic MikleAKA';
const END_POINT = 'https://18.ecmascript.pages.academy/big-trip';

const tripEventApiService = new ApiServer(END_POINT, AUTHORIZATION);

const tripEventModel = new TripPointModel({tripEventApiService});

const offerModel = new ModelOffer({tripEventApiService});
const destinationModel = new ModelDestinations({tripEventApiService});
const filterModel = new ModelFilters();

const tripPresenter = new MainPresenter(
  tripEventsSection,
  {
    tripEventModel,
    destinationModel,
    offerModel,
    filterModel,
    onCreateTripEventDestroy
  });

const filterPresenter = new FilterPresenter({filterContainer, filterModel, tripEventModel});

const createTripEventButton = new CreateTripEventButton({
  onClick: () => {
    tripPresenter.createEvent();
    createTripEventButton.element.disabled = true;
  }
});

function onCreateTripEventDestroy() {
  createTripEventButton.element.disabled = false;
} // function so it can be used in trip presenter

tripEventModel.init().finally(() => render(createTripEventButton, headerBlock));
tripPresenter.init();
filterPresenter.init();
