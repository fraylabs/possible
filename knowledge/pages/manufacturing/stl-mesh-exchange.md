---
slug: stl-mesh-exchange
title: STL mesh exchange
summary: A simple triangulated surface format widely used in additive workflows, with no intrinsic unit declaration or parametric feature history and limited manufacturing metadata.
tags:
  - stl
  - mesh
  - additive
  - unitless
reviewedAt: 2026-07-17
sources:
  - title: STL file format family
    url: https://www.loc.gov/preservation/digital/formats/fdd/fdd000504.shtml
  - title: Fusion export mesh guidance
    url: https://help.autodesk.com/cloudhelp/ENU/Fusion-Model/files/SLD-3D-PRINT.htm
---
STL is a simple triangulated surface format used widely in additive workflows. It has no intrinsic unit declaration, no parametric feature history, and limited manufacturing metadata.

Use STL only when the selected additive workflow explicitly accepts it. Record units, orientation, and mesh refinement out of band, and do not treat STL as precision-editable native CAD. Choose [3MF additive exchange](/wiki/3mf-additive-exchange) when defined units or richer print metadata matter, and choose [STEP solid exchange](/wiki/step-solid-exchange) when the recipient needs exact neutral solid geometry instead of a mesh.

Verification should confirm that the package states units clearly and that the mesh is refined enough for the intended process. STL is commonly consumed by FDM slicer workflows, but that compatibility does not remove the need for a real preview and geometry check before fabrication.
