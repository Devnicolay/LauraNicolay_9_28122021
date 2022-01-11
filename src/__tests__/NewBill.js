import { fireEvent, screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import Router from "../app/Router";
import { bills } from "../fixtures/bills.js";
import store from "../__mocks__/store";
import BillsUI from "../views/BillsUI.js";

describe("Given I am connected as an employee", () => {
  // Build DOM employee
  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
  });
  const user = JSON.stringify({
    type: "Employee",
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

    test("Then I add an image in correct format than jpg, png or jpeg", () => {
      // Build DOM for new bill page
      const html = NewBillUI();
      document.body.innerHTML = html;

      // Mock function handleChangeFile()
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });

      const mockHandleChangeFile = jest.fn(newBill.handleChangeFile);

      const inputJustificative = screen.getByTestId("file");
      expect(inputJustificative).toBeTruthy();

      // Simulate if the file is an jpg extension
      inputJustificative.addEventListener("change", mockHandleChangeFile);
      fireEvent.change(inputJustificative, {
        target: {
          files: [new File(["file.jpg"], "file.jpg", { type: "file/jpg" })],
        },
      });

      expect(mockHandleChangeFile).toHaveBeenCalled();
      expect(inputJustificative.files[0].name).toBe("file.jpg");

      expect(inputJustificative.files[0]).toBeTruthy();

      jest.spyOn(window, "alert").mockImplementation(() => {});
      expect(window.alert).not.toHaveBeenCalled();

      const mockHandleStore = jest.fn(newBill.handleStore);
      expect(mockHandleStore).toHaveBeenCalled();
    });

    test("Then I add an file in incorrect format than jpg, png or jpeg", () => {
      // Build DOM for new bill page
      const html = NewBillUI();
      document.body.innerHTML = html;

      // Mock function handleChangeFile()
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

      const mockHandleChangeFile = jest.fn(newBill.handleChangeFile);

      const inputJustificative = screen.getByTestId("file");
      expect(inputJustificative).toBeTruthy();

      // Simulate if the file is wrong format and is not an jpg, png or jpeg extension
      inputJustificative.addEventListener("change", mockHandleChangeFile);
      fireEvent.change(inputJustificative, {
        target: {
          files: [new File(["file.pdf"], "file.pdf", { type: "file/pdf" })],
        },
      });
      expect(mockHandleChangeFile).toHaveBeenCalled();
      expect(inputJustificative.files[0].name).not.toBe("file.jpg");

      const mockHandleStore = jest.fn(newBill.handleStore);
      expect(mockHandleStore).not.toHaveBeenCalled();

      jest.spyOn(window, "alert").mockImplementation(() => {});
      expect(window.alert).toHaveBeenCalled();
    });

    describe("Given when click on submit button of form new bill", () => {
      test("Then new bill should be submitted and redirect to bills page", () => {
        // Build DOM new bill
        const html = NewBillUI();
        document.body.innerHTML = html;

        // Mock function handleSubmit()
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

        expect(screen.getAllByText("Hôtel à Paris")).toBeTruthy();
        expect(screen.getAllByText("4 Jan. 21")).toBeTruthy();
        expect(screen.getAllByText("149 €")).toBeTruthy();
      });
    });
  });
});

describe("Given I am an user connected as employee", () => {
  describe("When I navigate to Dashboard employee", () => {
    test("Add bills from mock API POST", async () => {
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

    test("Add bills from an API and fails with 404 message error", async () => {
      store.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      );
      const html = BillsUI({ error: "Erreur 404" });
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });

    test("Add bill from an API and fails with 500 message error", async () => {
      store.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      );
      const html = BillsUI({ error: "Erreur 500" });
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });
  });
});
