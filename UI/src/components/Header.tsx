import * as React from "react";
import { Navbar, Nav } from "react-bootstrap";
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
          <LinkContainer to="/campaign/">
            <Nav.Link href="/campaign/">My Campaigns</Nav.Link>
          </LinkContainer>
        </Nav>
      </Navbar.Collapse>
      </div>
    </Navbar>
  </header>
);
