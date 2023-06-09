import {convertToDateTime, convertToEventDate, convertToEventDateTime, convertToTime} from '../utils/util';
import AbstractView from '../framework/view/abstract-view';


const createOffersTemplate = (offers) => offers.map((offer) => `
    <li class="event__offer">
      <span class="event__offer-title">${offer.title}</span>
      &plus;&euro;&nbsp;
      <span class="event__offer-price">${offer.price}</span>
    </li>
  `).join('');

const createTripEventTemplate = (tripPoint, destinations, offers) => {

  const destination = destinations.find((d) => d.id === tripPoint.destination);

  const offersObj = offers.find((e) => e.type === tripPoint.type) || {offers: []};

  return `<li class="trip-events__item">
    <div class="event">
        <time class="event__date" datetime="${convertToEventDateTime(tripPoint.dateFrom)}">${convertToEventDate(tripPoint.dateFrom)}</time>
        <div class="event__type">
            <img class="event__type-icon" width="42" height="42" src="img/icons/${tripPoint.type}.png" alt="Event type icon">
        </div>
        <h3 class="event__title">${destination.name}</h3>
        <div class="event__schedule">
            <p class="event__time">
                <time class="event__start-time" datetime="${convertToDateTime(tripPoint.dateFrom)}">${convertToTime(tripPoint.dateFrom)}</time>
                    &mdash;
                <time class="event__end-time" datetime="${convertToDateTime(tripPoint.dateTo)}">${convertToTime(tripPoint.dateTo)}</time>
            </p>
        </div>
        <p class="event__price">
        &euro;&nbsp;<span class="event__price-value">${tripPoint.basePrice}</span>
        </p>
        <h4 class="visually-hidden">Offers:</h4>
        <ul class="event__selected-offers">
            ${createOffersTemplate(offersObj.offers.filter((e) => tripPoint.offersIDs.includes(e.id)))}
        </ul>
        <button class="event__rollup-btn" type="button">
            <span class="visually-hidden">Open event</span>
        </button>
    </div>
  </li>`;
};


export default class TripPointView extends AbstractView {
  #tripPoint;
  #destinations;
  #offers;

  constructor({tripPoint, onRollupClick, destinations, offers}) {
    super();
    this.#tripPoint = tripPoint;
    this.#offers = offers;
    this.#destinations = destinations;
    this._callback.onRollupClick = onRollupClick;

    this.element.querySelector('.event__rollup-btn',).addEventListener('click', this.#rollupHandler);
  }

  get template() {
    return createTripEventTemplate(this.#tripPoint, this.#destinations, this.#offers);
  }

  #rollupHandler = (evt) => {
    evt.preventDefault();
    this._callback.onRollupClick();
  };
}
