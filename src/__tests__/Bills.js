import { fireEvent, screen } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import LoginUI from "../views/LoginUI";
import Login from "../containers/Login.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import DashboardFormUI from "../views/DashboardFormUI.js";
import Dashboard, { filteredBills, cards } from "../containers/Dashboard.js";
import VerticalLayout from "../views/VerticalLayout.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills";
import Router from "../app/Router";
import Actions from "../views/Actions.js";

describe("Given I am connected as an employee", () => {
  test("Then I am on Bills Page", () => {
    // Build DOM with data of bills
    const html = BillsUI({ data: [] });
    document.body.innerHTML = html;

    expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();

    expect(screen.getAllByText("Billed")).toBeTruthy();
  });
  test("Then bills should be ordered from earliest to latest", () => {
    // Build DOM with data of bills
    const html = BillsUI({ data: bills });
    document.body.innerHTML = html;

    const dates = screen
      .getAllByText(
        /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
      )
      .map((a) => a.innerHTML);
    const antiChrono = (a, b) => (a < b ? 1 : -1);
    const datesSorted = [...dates].sort(antiChrono);
    expect(dates).toEqual(datesSorted);
  });
});

describe("Given I am connected as Employee", () => {
  test("Then bill icon in vertical layout should be highlighted", () => {
    // Build DOM as if I am an employee
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    const user = JSON.stringify({
      type: "Employee",
    });
    window.localStorage.setItem("user", user);

    // Build DOM with Bills
    const pathBills = ROUTES_PATH["Bills"];
    Object.defineProperty(window, "location", { value: { hash: pathBills } });
    document.body.innerHTML = `<div id="root"></div>`;

    // Router to have active class
    Router();

    expect(
      screen.getByTestId("icon-window").classList.contains("active-icon")
    ).toBe(true);

    expect(screen.getAllByText("Billed")).toBeTruthy();
  });
});

describe("Given I am on Bills page and it's loading", () => {
  test("Then it should have a loading page", () => {
    // Build DOM as if page is loading
    const html = BillsUI({
      data: [],
      loading: true,
    });
    document.body.innerHTML = html;

    expect(screen.getAllByText("Loading...")).toBeTruthy();
  });
});

describe("Given I am on Bills page and there is an error", () => {
  test("Then it should have an error page", () => {
    // Build DOM as if page is not loading and have an error
    const html = BillsUI({
      data: [],
      loading: false,
      error: "erreur",
    });
    document.body.innerHTML = html;

    expect(screen.getAllByText("Erreur")).toBeTruthy();
  });
});

describe("Given I am on Bills page and I click on icon eye", () => {
  test("Then it should have open modal", () => {
    // Build DOM as if I am an employee
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    const user = JSON.stringify({
      type: "Employee",
    });
    window.localStorage.setItem("user", user);

    // Build DOM with data of bills
    const html = BillsUI({ data: bills });
    document.body.innerHTML = html;

    // Mock function handleClickIconEye()
    const store = null;
    const dashboard = new Dashboard({
      document,
      onNavigate,
      store,
      bills,
      localStorage: window.localStorage,
    });

    const mockHandleClickIconEye = jest.fn(dashboard.handleClickIconEye);

    const eyes = screen.getAllByTestId("icon-eye");
    expect(eyes).toBeTruthy();

    eyes.forEach((eye) => {
      eye.addEventListener("click", mockHandleClickIconEye);
      userEvent.click(eye);
      expect(mockHandleClickIconEye).toHaveBeenCalled();

      // Test à finir
      //const modale = screen.getByRole("dialog");
      //expect(modale).toBeTruthy();
      //expect(modale).classList.contains("modal fade show");
    });
  });
});
