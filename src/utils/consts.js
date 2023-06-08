import dayjs from 'dayjs';

export const FILTER_TYPE = {
  EVERYTHING: 'everything',
  FUTURE: 'future',
  PAST: 'past'
};

export const FILTER_TYPE_DESCRIPTION = {
  [FILTER_TYPE.EVERYTHING]: 'EVERYTHING',
  [FILTER_TYPE.PAST]: 'PAST',
  [FILTER_TYPE.FUTURE]: 'FUTURE',
};

export const SORT_TYPE = {
  DAY: 'day',
  EVENT: 'event',
  TIME: 'time',
  PRICE: 'price',
  OFFER: 'offer'
};

export const SORT_TYPE_DESCRIPTION = {
  [SORT_TYPE.DAY]: 'Day',
  [SORT_TYPE.EVENT]: 'Event',
  [SORT_TYPE.TIME]: 'Time',
  [SORT_TYPE.PRICE]: 'Price',
  [SORT_TYPE.OFFER]: 'Offer'
};

export const SORTS = {
  [SORT_TYPE.DAY]: undefined,
  [SORT_TYPE.EVENT]: undefined,
  [SORT_TYPE.OFFER]: undefined,
  [SORT_TYPE.PRICE]: (pointA, pointB) => pointB.basePrice - pointA.basePrice,
  [SORT_TYPE.TIME]: (pointA, pointB) => dayjs(pointA.dateFrom).diff(dayjs(pointB.dateFrom)),
};

export const USER_ACTION = {
  UPDATE_TRIPPOINT: 'UPDATE_TRIPPOINT',
  ADD_TRIPPOINT: 'ADD_TRIPPOINT',
  DELETE_TRIPPOINT: 'DELETE_TRIPPOINT',
};

export const UPDATE_TYPE = {
  PATCH: 'PATCH',
  MINOR: 'MINOR',
  MAJOR: 'MAJOR',
  INIT: 'INIT'
};

export const TRIP_TYPES = ['taxi', 'bus', 'train', 'ship', 'drive', 'flight', 'check-in', 'sightseeing', 'restaurant'];
