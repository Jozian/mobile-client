import React, { PropTypes } from 'react';
import cx from 'classnames';
import { BackButton } from 'components';

import styles from './Header.scss';

export default function renderComponent(props) {
  return (
    <div className={cx(styles.header, props.className)}>
      <BackButton className={styles.back} confirm={props.confirm} />
      <span className={styles.title}>{props.title}</span>
    </div>

  );
}

renderComponent.defaultProps = {
  className: '',
};

renderComponent.propTypes = {
  className: PropTypes.string,
  title: PropTypes.string.isRequired,
  confirm: PropTypes.bool,
};

renderComponent.contextTypes = {
  router: PropTypes.object,
};
