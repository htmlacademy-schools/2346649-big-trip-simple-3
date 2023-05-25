import Presenter from './presenter/presenter';
import FiltersView from './View/filter-view';
import {render} from './framework/render';
import TripPointModel from './model/model';
import {generateFilter} from './mock/filter';
// import PointPresenter from './presenter/point-presenter';

const tripControlsFilters = document.querySelector('.trip-controls__filters');
const container = document.querySelector('.trip-events');

const tripPointsModel = new TripPointModel();
const presenter = new Presenter({container, tripPointsModel});

const filters = generateFilter(tripPointsModel.tripPoints);

render(new FiltersView({filters}), tripControlsFilters);

presenter.init();
