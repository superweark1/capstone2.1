import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Gradeteacher.css"; // Optional CSS for styling

const Gradeteacher = () => {
  const [projectGrade, setProjectGrade] = useState(0);
  const [contentGrade, setContentGrade] = useState(0);
  const [presentationGrade, setPresentationGrade] = useState(0);
  const [panelRole, setPanelRole] = useState(""); // Panel Role: Panel Head or Panel Member
  const [selectedGroup, setSelectedGroup] = useState(""); // Group Name
  const [recommendation, setRecommendation] = useState("");
  const [revisionType, setRevisionType] = useState(""); // Revision Type: Minor or Major
  const [finalGrade, setFinalGrade] = useState("");
  const [paneltypes, setPaneltypes] = useState(""); // Panel Type: Panel 1, Panel 2
  const [groupNames, setGroupNames] = useState([]); // Group Names fetched from backend
  const [grades, setGrades] = useState([]); // State to store fetched grades
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Fetch group names from backend on component mount
  useEffect(() => {
    const fetchGroupNames = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/assign`
        );
        setGroupNames(response.data);
      } catch (error) {
        console.error("Error fetching group names:", error);
      }
    };

    fetchGroupNames();
  }, []);

  useEffect(() => {
    // Fetch data from the backend when the component is mounted
    axios
      .get(`${process.env.REACT_APP_API_URL}/grades`)
      .then((response) => {
        setGrades(response.data); // Set the grades data into state
      })
      .catch((error) => {
        console.error("Error fetching grades:", error);
      });
  }, []);

  const panelRoles = ["Panel Head", "Panel Member"];
  const revisionTypes = ["Minor Revision", "Major Revision"];
  const panelTypes = ["Panel 1", "Panel 2"];

  const calculateFinalGrade = (panelHeadGrade, panel1Grade, panel2Grade) => {
    // Average the grades from all three panels
    const averageGrade = (panelHeadGrade + panel1Grade + panel2Grade) / 3;

    // Convert the average grade to the final grade scale
    let convertedGrade;

    if (averageGrade >= 95) {
      convertedGrade = "1.00";
    } else if (averageGrade >= 90) {
      convertedGrade = "1.25";
    } else if (averageGrade >= 85) {
      convertedGrade = "1.50";
    } else if (averageGrade >= 80) {
      convertedGrade = "1.75";
    } else if (averageGrade >= 75) {
      convertedGrade = "2.00";
    } else if (averageGrade >= 70) {
      convertedGrade = "2.25";
    } else if (averageGrade >= 65) {
      convertedGrade = "2.50";
    } else if (averageGrade >= 60) {
      convertedGrade = "2.75";
    } else if (averageGrade >= 50) {
      convertedGrade = "3.00 - Pass";
    } else if (averageGrade >= 40) {
      convertedGrade = "4.00 - Conditional";
    } else {
      convertedGrade = "5.00 - Fail";
    }

    return convertedGrade;
  };

  const calculateGrade = () => {
    // Compute total points
    const totalPoints = projectGrade + contentGrade + presentationGrade;

    // Compute percentage
    const percentage = (totalPoints / 100) * 100;

    // Determine equivalent grade
    let equivalentGrade;
    if (percentage >= 96) equivalentGrade = 1.0;
    else if (percentage >= 91) equivalentGrade = 1.25;
    else if (percentage >= 86) equivalentGrade = 1.5;
    else if (percentage >= 81) equivalentGrade = 1.75;
    else if (percentage >= 76) equivalentGrade = 2.0;
    else if (percentage >= 71) equivalentGrade = 2.25;
    else if (percentage >= 66) equivalentGrade = 2.5;
    else if (percentage >= 60) equivalentGrade = 3.0;
    else equivalentGrade = 5.0;

    return { totalPoints, percentage, equivalentGrade };
  };

  const submitGrade = async () => {
    // Log the payload before sending
    console.log("Submitting payload:", {
      group_name: selectedGroup,
      panelRole,
      paneltypes,
      projectGrade,
      contentGrade,
      presentationGrade,
      recommendation,
      revisionType,
    });

    // Ensure all fields are filled
    if (!selectedGroup || !panelRole || !recommendation) {
      window.alert("Please fill in all required fields.");
      return;
    }

    let gradeColumn;
    if (panelRole === "Panel Head") {
      gradeColumn = "panelhead_grades";
    } else if (panelRole === "Panel Member") {
      if (paneltypes === "Panel 1") {
        gradeColumn = "panel_1_grades";
      } else if (paneltypes === "Panel 2") {
        gradeColumn = "panel_2_grades";
      }
    }

    if (!gradeColumn) {
      window.alert("Please select a valid panel type.");
      return;
    }

    const { totalPoints } = calculateGrade();
    const finalGrade = calculateFinalGrade(
      parseFloat(projectGrade || 0),
      parseFloat(contentGrade || 0),
      parseFloat(presentationGrade || 0)
    );

    const payload = {
      group_name: selectedGroup,
      [gradeColumn]: totalPoints, // Send totalPoints for the specific panel grade
      ...(panelRole === "Panel Head" && {
        panelhead_recommendation: recommendation,
      }),
      ...(panelRole === "Panel Member" &&
        paneltypes === "Panel 1" && { panel_1_recommendation: recommendation }),
      ...(panelRole === "Panel Member" &&
        paneltypes === "Panel 2" && { panel_2_recommendation: recommendation }),
      ...(panelRole === "Panel Head" && { revision_type: revisionType }),
      final_grade: finalGrade, // Send the calculated final grade separately
    };

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/grades1`,
        payload
      );
      console.log("Grade updated successfully:", response.data);
      window.alert("Grade updated successfully!");
    } catch (error) {
      console.error("Error updating grade:", error); // Log the full error object
      window.alert("Error updating grade. Please try again.");
    }
  };
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };
  return (
    <div className="GradeteachergradingWrapper">
      <div className="Gradeteachergradingtable">
        <div className="Gradeteachertable-container">
          <table className="Gradeteachertable">
            <thead>
              <tr>
                <th>Group Name</th>
                <th>Panel 1 Grades</th>
                <th>Panel 2 Grades</th>
                <th>Panel Head Grades</th>
                <th>Panel 1 Recommendation</th>
                <th>Panel 2 Recommendation</th>
                <th>Panel Head Recommendation</th>
                <th>Revision Type</th>
                <th>Final Grades</th>
              </tr>
            </thead>
            <tbody>
              {grades.length > 0 ? (
                grades.map((grade, index) => {
                  const finalGrade = calculateFinalGrade(
                    parseFloat(grade.panelhead_grades || 0),
                    parseFloat(grade.panel_1_grades || 0),
                    parseFloat(grade.panel_2_grades || 0)
                  );
                  return (
                    <tr key={index}>
                      <td>{grade.group_name}</td>
                      <td>{grade.panel_1_grades}</td>
                      <td>{grade.panel_2_grades}</td>
                      <td>{grade.panelhead_grades}</td>
                      <td>{grade.panel_1_recommendation}</td>
                      <td>{grade.panel_2_recommendation}</td>
                      <td>{grade.panelhead_recommendation}</td>
                      <td>{grade.revision_type}</td>
                      <td>{finalGrade}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9">No data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <button className="gradeteacherbutton" onClick={toggleModal}>
          Grade
        </button>

        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Grading Table</h2>

              <label>
                Select Group:
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                >
                  <option value="" disabled>
                    Choose a group
                  </option>
                  {groupNames.map((group, index) => (
                    <option key={index} value={group.group_name}>
                      {group.group_name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Panel Role:
                <select
                  value={panelRole}
                  onChange={(e) => setPanelRole(e.target.value)}
                >
                  <option value="" disabled>
                    Choose a role
                  </option>
                  {panelRoles.map((role, index) => (
                    <option key={index} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </label>

              {panelRole === "Panel Member" && (
                <label>
                  Panel Type:
                  <select
                    value={paneltypes}
                    onChange={(e) => setPaneltypes(e.target.value)}
                  >
                    <option value="" disabled>
                      Choose panel type
                    </option>
                    {panelTypes.map((type, index) => (
                      <option key={index} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <label>
                Project Grade:
                <input
                  type="number"
                  value={projectGrade}
                  onChange={(e) => setProjectGrade(Number(e.target.value))}
                />
              </label>

              <label>
                Content Grade:
                <input
                  type="number"
                  value={contentGrade}
                  onChange={(e) => setContentGrade(Number(e.target.value))}
                />
              </label>

              <label>
                Presentation Grade:
                <input
                  type="number"
                  value={presentationGrade}
                  onChange={(e) => setPresentationGrade(Number(e.target.value))}
                />
              </label>

              <label className="recommendation-label">
                Recommendation:
                <textarea
                  className="recommendation-grade"
                  value={recommendation}
                  onChange={(e) => setRecommendation(e.target.value)}
                />
              </label>

              {panelRole === "Panel Head" && (
                <label>
                  Revision Type:
                  <select
                    value={revisionType}
                    onChange={(e) => setRevisionType(e.target.value)}
                  >
                    <option value="" disabled>
                      Choose revision type
                    </option>
                    {revisionTypes.map((type, index) => (
                      <option key={index} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <div className="modal-actions">
                <button onClick={submitGrade}>Submit Grade</button>
                <button onClick={toggleModal}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gradeteacher;
