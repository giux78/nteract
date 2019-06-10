import React, { Fragment, SyntheticEvent, PureComponent } from "react";
import { connect } from "react-redux";
import { Intent, Button } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";

import { usernameSelector, isUserLogged, resetLogin } from "../duck/loginDuck";
import { ILoginLogoutButtonProps, ILoginLogoutButtonState } from "../types";
import LoginDialogContainer from "./LoginDialogContainer";

const { LOG_OUT, LOG_IN } = IconNames;

class LoginLogoutButton extends PureComponent<
  ILoginLogoutButtonProps,
  ILoginLogoutButtonState
> {
  constructor(props) {
    super(props);
    this.handleVisibility = this.handleVisibility.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
  }

  public state: ILoginLogoutButtonState = { isOpen: false };

  private handleVisibility(e: SyntheticEvent): void {
    e.preventDefault();
    this.setState({ isOpen: !this.state.isOpen });
  }

  private handleLogout(e: SyntheticEvent): void {
    e.preventDefault();
    this.props.resetLogin();
  }

  public render(): JSX.Element {
    const { handleVisibility, handleLogout } = this;
    const { username, isUserLogged } = this.props;
    const { isOpen } = this.state;
    return (
      <Fragment>
        <Button
          intent={Intent.PRIMARY}
          rightIcon={isUserLogged ? LOG_OUT : LOG_IN}
          onClick={isUserLogged ? handleLogout : handleVisibility}
          children={<b>{isUserLogged ? `${username} - Log out` : "Log in"}</b>}
        />
        <LoginDialogContainer
          isOpen={isOpen && !isUserLogged}
          onClose={handleVisibility}
        />
      </Fragment>
    );
  }
}

const LoginLogoutButtonContainer = connect(
  state => ({
    ...usernameSelector(state),
    ...isUserLogged(state)
  }), // mapStateToProps,
  { resetLogin } // mapDispatchToProps
)(LoginLogoutButton);

export default LoginLogoutButtonContainer;
