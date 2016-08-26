import React, { PropTypes } from 'react';
import cx from 'classnames';
import styles from './ProgressBar.scss';
export default function renderComponent(props) {
  return (
    <div className={
      cx({
        [styles.inProgress]: props.inProgress,
        [styles.container]: true,
        [props.className]: true,
      })}
    >
      <div className={styles.wrapper}>
      {
        [1, 2].map(() =>
          ['part1', 'part2', 'part3', 'part4'].map((item) =>
            <div className={cx(styles.part, styles[item])} />
          )
        )
      }
      </div>
    </div>
  );
}

renderComponent.propTypes = {
  inProgress: PropTypes.bool,
  className: PropTypes.string,
};
