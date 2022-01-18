import { fireEvent, screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import Router from "../app/Router";
import store from "../__mocks__/store";
import BillsUI from "../views/BillsUI.js";

describe("Given I am connected as an employee", () => {
  // Build DOM employee
  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
  });
  const user = JSON.stringify({
    type: "Employee",
    email: "employee@test.fr",
  });
  window.localStorage.setItem("user", user);

  describe("When I am on NewBill Page", () => {
    test("Then email icon in vertical layout should be highlighted", () => {
      // Build DOM New Bill
      const pathNewBills = ROUTES_PATH["NewBill"];
      Object.defineProperty(window, "location", {
        value: { hash: pathNewBills },
      });
      document.body.innerHTML = `<div id="root"></div>`;

      // Router to have active class
      Router();

      const iconMail = screen.getByTestId("icon-mail");

      expect(iconMail.classList.contains("active-icon")).toBe(true);
    });

    describe("When I add an image in correct format than jpg, png or jpeg", () => {
      test("Then It should import file name and no alert should be displayed", async () => {
        // Build DOM for new bill page
        const html = NewBillUI();
        document.body.innerHTML = html;

        // Instantiate NewBill()
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        const mockStore = {
          bills: jest.fn(() => newBill.store),
          create: jest.fn(() => Promise.resolve({})),
        };

        const newBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });

        // Mocks
        newBill.handleStore = jest.fn(newBill.handleStore);
        newBill.handleChangeFile = jest.fn(newBill.handleChangeFile);
        const mockAlert = jest.spyOn(window, "alert");
        window.alert = jest.fn();

        const inputJustificative = screen.getByTestId("file");

        // Simulate if the file is an jpg extension
        fireEvent.change(inputJustificative, {
          target: {
            files: [new File(["file.jpg"], "file.jpg", { type: "file/jpg" })],
          },
        });

        expect(inputJustificative.files[0].name).toBe("file.jpg");

        expect(mockAlert).not.toHaveBeenCalled();

        await waitFor(() =>
          expect(newBill.handleChangeFile).toHaveBeenCalled()
        );
        await waitFor(() => expect(newBill.handleStore).toHaveBeenCalled());
      });
    });

    describe("When I add an file in incorrect format than jpg, png or jpeg", () => {
      test("Then the file name is not imported and an alert displayed", () => {
        // Build DOM for new bill page
        const html = NewBillUI();
        document.body.innerHTML = html;

        // Instantiate NewBill()
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const newBill = new NewBill({
          document,
          onNavigate,
          store,
          localStorage: window.localStorage,
        });

        // Mocks
        newBill.handleChangeFile = jest.fn(newBill.handleChangeFile);
        newBill.handleStore = jest.fn(newBill.handleStore);
        window.alert = jest.fn();

        const inputJustificative = screen.getByTestId("file");
        expect(inputJustificative).toBeTruthy();

        // Simulate if the file is wrong format and is not an jpg, png or jpeg extension
        fireEvent.change(inputJustificative, {
          target: {
            files: [new File(["file.pdf"], "file.pdf", { type: "file/pdf" })],
          },
        });
        expect(newBill.handleChangeFile).toHaveBeenCalled();
        expect(inputJustificative.files[0].name).not.toBe("file.jpg");

        expect(newBill.handleStore).not.toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalled();
      });
    });

    describe("Given when click on submit button of form new bill", () => {
      test("Then new bill should be submitted and create and redirect to bills page", () => {
        // Build DOM new bill
        const html = NewBillUI();
        document.body.innerHTML = html;

        // Instantiate NewBill()
        const store = null;
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        const newBill = new NewBill({
          document,
          onNavigate,
          store,
          localStorage: window.localStorage,
        });

        // Mock data of new bill
        const dataNewBill = {
          id: "47qAXb6fIm2zOKkLzMro",
          vat: "80",
          fileUrl:
            "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
          status: "pending",
          type: "Hôtel",
          commentary: "séminaire billed",
          name: "Hôtel à Paris",
          fileName: "preview-facture-free-201801-pdf-1.jpg",
          date: "2021-01-04",
          amount: 149,
          commentAdmin: "ok",
          email: "a@a",
          pct: 20,
        };

        screen.getByTestId("expense-type").value = dataNewBill.type;
        screen.getByTestId("expense-name").value = dataNewBill.name;
        screen.getByTestId("datepicker").value = dataNewBill.date;
        screen.getByTestId("amount").value = dataNewBill.amount;
        screen.getByTestId("vat").value = dataNewBill.vat;
        screen.getByTestId("pct").value = dataNewBill.pct;
        screen.getByTestId("commentary").value = dataNewBill.commentary;
        screen.getByTestId("expense-type").value = dataNewBill.type;
        newBill.fileUrl = dataNewBill.fileUrl;
        newBill.fileName = dataNewBill.fileName;

        const submitFormNewBill = screen.getByTestId("form-new-bill");
        expect(submitFormNewBill).toBeTruthy();

        // Mock function handleSubmit()
        const mockHandleSubmit = jest.fn(newBill.handleSubmit);
        submitFormNewBill.addEventListener("submit", mockHandleSubmit);
        fireEvent.submit(submitFormNewBill);

        expect(mockHandleSubmit).toHaveBeenCalled();

        // Mock function updateBill()
        const mockCreateBill = jest.fn(newBill.updateBill);
        submitFormNewBill.addEventListener("submit", mockCreateBill);
        fireEvent.submit(submitFormNewBill);

        expect(mockCreateBill).toHaveBeenCalled();
        // When form new bill is submited, return on bills page
        expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
      });
    });
  });
});

describe("When I navigate to Dashboard employee", () => {
  test("Then it add bills from mock API POST", async () => {
    const getSpy = jest.spyOn(store, "post");
    const newBill = {
      id: "47qAXb6fIm2zOKkLzMro",
      vat: "80",
      fileUrl:
        "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
      status: "pending",
      type: "Hôtel et logement",
      commentary: "séminaire billed",
      name: "encore",
      fileName: "preview-facture-free-201801-pdf-1.jpg",
      date: "2004-04-04",
      amount: 400,
      commentAdmin: "ok",
      email: "a@a",
      pct: 20,
    };
    const bills = await store.post(newBill);
    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(bills.data.length).toBe(5);
  });

  test("Then it add bills from an API and fails with 404 message error", async () => {
    store.post.mockImplementationOnce(() =>
      Promise.reject(new Error("Erreur 404"))
    );
    const html = BillsUI({ error: "Erreur 404" });
    document.body.innerHTML = html;
    const message = await screen.getByText(/Erreur 404/);
    expect(message).toBeTruthy();
  });

  test("Then it add bill from an API and fails with 500 message error", async () => {
    store.post.mockImplementationOnce(() =>
      Promise.reject(new Error("Erreur 500"))
    );
    const html = BillsUI({ error: "Erreur 500" });
    document.body.innerHTML = html;
    const message = await screen.getByText(/Erreur 500/);
    expect(message).toBeTruthy();
  });
});
