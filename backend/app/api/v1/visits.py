from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.visit import Visit
from app.models.patient import Patient
from app.schemas.visit import VisitCreate, VisitUpdate, VisitResponse
from app.core.security import get_current_user

router = APIRouter()


@router.get("", response_model=List[VisitResponse])
def get_visits(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    visits = db.query(Visit).offset(skip).limit(limit).all()
    return visits


@router.post("", response_model=VisitResponse, status_code=status.HTTP_201_CREATED)
def create_visit(
    visit_data: VisitCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    patient = db.query(Patient).filter(Patient.id == visit_data.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    new_visit = Visit(**visit_data.model_dump())
    db.add(new_visit)
    db.commit()
    db.refresh(new_visit)
    return new_visit


@router.get("/{visit_id}", response_model=VisitResponse)
def get_visit(
    visit_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    visit = db.query(Visit).filter(Visit.id == visit_id).first()
    
    if not visit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Visit not found"
        )
    
    return visit


@router.put("/{visit_id}", response_model=VisitResponse)
def update_visit(
    visit_id: int,
    visit_data: VisitUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    visit = db.query(Visit).filter(Visit.id == visit_id).first()
    
    if not visit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Visit not found"
        )
    
    update_data = visit_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(visit, field, value)
    
    db.commit()
    db.refresh(visit)
    return visit


@router.delete("/{visit_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_visit(
    visit_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    visit = db.query(Visit).filter(Visit.id == visit_id).first()
    
    if not visit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Visit not found"
        )
    
    db.delete(visit)
    db.commit()
    return None
