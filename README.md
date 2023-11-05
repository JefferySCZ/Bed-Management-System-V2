# Hospital Bed Management System

A system designed to manage hospital bed occupancy and waiting list patients effectively.

## Description

This system enables hospital staff to monitor available beds, admit patients from a waiting list, and discharge patients efficiently. It is integrated with a real-time updating database to ensure data accuracy. Additionally, all patient information is recorded within the system. The report page allows for specific patient searches or report downloads for further use.

## Installation

You will need to the zip file of the project and extract it to your desired directory.

1. Extract the zip file into your chosen directory.
2. Open a terminal and navigate to the extracted project directory: **`cd path/to/hospital-bed-management`**.
3. Once inside the project directory, set up your project environment:

```bash
npm init -y
```

4. After setting up your project environment, install the required dependencies: **`npm install express body-parser --save`**.
5. To start the application, run: **`npm start`**.
6. Use the following credentials to login:
   Username: admin
   Password: admin

## Usage

1. Enter the patient's details and press 'Register'.
2. The system will automatically assign a bed for the patient in a specific ward category.
3. If the ward is full, the patient will be placed on a waiting list until a bed becomes available.
4. Hover the mouse over the bed to quickly check the current patient's details, such as patient ID, name, age, and illness.
5. To admit a patient from the waiting list and assign a bed, click the 'Admit' button.
6. To discharge a patient, find the 'Discharge' button next to the occupied bed and click it.
7. On the report page, you will see data for all registered patients.
8. You can check their details or through **EXPORT** download the patient data report for further use.

## Contributing

Contributions to this project are appreciated. For substantial changes, please first open an issue to discuss your proposed changes.

## Support and Contact

Should you have any questions or require support, please email [[jeffery.sim.cz@gmail.com](mailto:jeffery.sim.cz@gmail.com)]
