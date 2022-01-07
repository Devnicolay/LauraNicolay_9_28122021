import { screen, fireEvent } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import Bills from "../containers/Bills.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import Router from "../app/Router";
import store from "../__mocks__/store";
import { sortDate } from "../views/BillsUI.js";

describe("Given I am connected as an employee", () => {
  // Build DOM as if I am an employee
  function buildDomEmployee() {
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    const user = JSON.stringify({
      type: "Employee",
    });
    window.localStorage.setItem("user", user);
  }
  test("Then I am on Bills Page", () => {
    // Build DOM as if I am an employee
    buildDomEmployee();
    // Build DOM with data of bills
    const html = BillsUI({ data: [] });
    document.body.innerHTML = html;

    expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();

    expect(screen.getAllByText("Billed")).toBeTruthy();
  });

  test("Then data of bill are display", () => {
    // Build DOM as if I am an employee
    buildDomEmployee();

    // Build DOM with data of bills
    const html = BillsUI({ data: bills });
    document.body.innerHTML = html;

    const typeOfBill = screen.getAllByTestId("type");
    expect(typeOfBill).toBeTruthy();

    const nameOfBill = screen.getAllByTestId("name");
    expect(nameOfBill).toBeTruthy();

    const dateOfBill = screen.getAllByTestId("date");
    expect(dateOfBill).toBeTruthy();

    const amountOfBill = screen.getAllByTestId("amount");
    expect(amountOfBill).toBeTruthy();

    const statusOfBill = screen.getAllByTestId("status");
    expect(statusOfBill).toBeTruthy();

    const eyes = screen.getAllByTestId("icon-eye");
    expect(eyes).toBeTruthy();
  });

  test("Then bill icon in vertical layout should be highlighted", () => {
    // Build DOM as if I am an employee
    buildDomEmployee();

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

  test("Then bills should be ordered from earliest to latest", () => {
    // Build DOM with data of bills
    const html = BillsUI({ data: sortDate(bills) });
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

  describe("When I click on button 'Nouvelle note de frais'", () => {
    test("Then it should render new bill form", () => {
      const btnNewBill = screen.getByTestId("btn-new-bill");
      expect(btnNewBill).toBeTruthy();

      // Mock function handleClickNewBill()
      const store = null;
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const mockBills = new Bills({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });

      const mockHandleClickNewBill = jest.fn(mockBills.handleClickNewBill());

      btnNewBill.addEventListener("click", mockHandleClickNewBill);
      fireEvent.click(btnNewBill);

      expect(mockHandleClickNewBill).toHaveBeenCalled();
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
    });
  });

  describe("Given I am on Bills page", () => {
    describe("When I click on icon eye", () => {
      test("Then it should have open modal", () => {
        // Build DOM as if I am an employee
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        const user = JSON.stringify({
          type: "Employee",
        });
        window.localStorage.setItem("user", user);

        // Build DOM with data of bills
        const html = BillsUI({ data: bills });
        document.body.innerHTML = html;

        // Mock function handleClickIconEye()
        const store = null;
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const mockBills = new Bills({
          document,
          onNavigate,
          store,
          localStorage: window.localStorage,
        });

        $.fn.modal = jest.fn();

        const eyes = screen.getAllByTestId("icon-eye");
        expect(eyes).toBeTruthy();

        const mockHandleClickIconEye = jest.fn(
          mockBills.handleClickIconEye(eyes[0])
        );

        eyes[0].addEventListener("click", mockHandleClickIconEye);
        fireEvent.click(eyes[0]);

        expect(mockHandleClickIconEye).toHaveBeenCalled();
      });
    });
  });
});

describe("Given I am a user connected as employee", () => {
  Object.defineProperty(window, "localStorage", { value: localStorageMock });
  const user = JSON.stringify({
    type: "Employee",
  });
  window.localStorage.setItem("user", user);

  describe("When it's loading", () => {
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

  describe("When there is an error", () => {
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

  describe("When I navigate to Dashboard employee", () => {
    test("fetches bills from mock API GET", async () => {
      const getSpy = jest.spyOn(store, "get");
      const bills = await store.get();
      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(bills.data.length).toBe(4);
    });

    test("fetches bills from an API and fails with 404 message error", async () => {
      store.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      );
      const html = BillsUI({ error: "Erreur 404" });
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });

    test("fetches messages from an API and fails with 500 message error", async () => {
      store.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      );
      const html = BillsUI({ error: "Erreur 500" });
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });
  });
});
