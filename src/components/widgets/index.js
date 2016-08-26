import Descriptive from './Descriptive/Descriptive';
import Time from './Time/Time';
import Date from './Date/Date';
import Select from './Select/Select';
import Select1 from './Select1/Select1';
import Note from './Note/Note';
import Cascade from './Cascade/Cascade';
import Binary from './Binary/Binary';
import Int from './Int/Int';
import Decimal from './Decimal/Decimal';
import Geolocation from './Geolocation/Geolocation';

import NotSupported from './NotSupported/NotSupported';
export default {
  string: Descriptive,
  int: Int,
  decimal: Decimal,
  time: Time,
  date: Date,
  select: Select,
  select1: Select1,
  cascade1: Cascade,
  cascade2: Cascade,
  cascade3: Cascade,
  cascade4: Cascade,
  cascade5: Cascade,
  note: Note,
  binary: Binary,
  geopoint: Geolocation,

  default: NotSupported,

};
