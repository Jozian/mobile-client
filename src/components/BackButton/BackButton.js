import React, { PropTypes } from 'react';
import { confirm } from 'helpers/platform/ui';
import cx from 'classnames';
import { AppBar } from 'react-winjs';

const confirmAction = action => async () => {
  const result = await confirm(
    'All unsaved data will be lost',
    'Are you sure you want to go back?',
  );
  if (result.id === true) {
    action();
  }
};

export default function renderComponent(props, ctx) {
  return (
    <button
      onClick={props.confirm ? confirmAction(ctx.router.goBack) : ctx.router.goBack}
      className={cx('win-navigation-backbutton', props.className)}
      aria-label="Back"
      icon="back"
      title="Back"
      type="button"
    >
      <span className="win-back" />
    </button>
  );
}

renderComponent.defaultProps = {
  className: '',
};

renderComponent.propTypes = {
  className: PropTypes.string,
  confirm: PropTypes.bool,
};

renderComponent.contextTypes = {
  router: PropTypes.object,
};
