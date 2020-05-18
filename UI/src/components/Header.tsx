import * as React from "react";
import { Navbar, Nav, NavDropdown } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { Link } from "react-router-dom";

interface Props {
  title: string
}

export const Header: React.FC<Props> = ({title}) => (
  <header>
    <Navbar collapseOnSelect 
            bg="primary" 
            variant="dark" 
            className="mb-3">
      <div className="container">

      <Navbar.Brand>
        <Link to={"/"}>{title}</Link>
      </Navbar.Brand>
      <Navbar.Toggle />
      <Navbar.Collapse className="justify-content-end">
        <Nav>
          <LinkContainer exact to="/">
            <Nav.Link href="/">Home Page</Nav.Link>
          </LinkContainer>
          
          <NavDropdown id="" title="Campaign Pages">
            <LinkContainer exact to="/campaign/create">
              <Nav.Link href="/campaign/create">Create Campaign</Nav.Link>
            </LinkContainer>
            <LinkContainer exact to="/campaign/737760">
              <Nav.Link href="/character/737760">View Campaign</Nav.Link>
            </LinkContainer>
          </NavDropdown>

          <NavDropdown id="" title="Character Pages">
            <LinkContainer exact to="/character">
              <Nav.Link href="/character">View Characters</Nav.Link>
            </LinkContainer>
            <LinkContainer exact to="/character/create">
              <Nav.Link href="/character/create">Create Character</Nav.Link>
            </LinkContainer>
          </NavDropdown>
        </Nav>
      </Navbar.Collapse>
      </div>
    </Navbar>
  </header>
);
