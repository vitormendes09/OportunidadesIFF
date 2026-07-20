import { Button, Card, CardActions, CardContent, Chip, Typography } from '@mui/material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import Link from 'next/link';
import type { JobResponseDto } from '@/types/api';

export function JobCard({ job }: { job: JobResponseDto }) {
  return (
    <Card variant="outlined" sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="h3" component="h2" sx={{ fontSize: 18 }}>
          {job.title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {job.companyName}
        </Typography>

        <div className="flex items-center gap-xs text-on-surface-variant">
          <LocationOnOutlinedIcon fontSize="small" />
          <Typography variant="body2">{job.workModel}</Typography>
        </div>
        <div className="flex items-center gap-xs text-on-surface-variant">
          <DescriptionOutlinedIcon fontSize="small" />
          <Typography variant="body2">{job.contractType}</Typography>
        </div>

        <Typography variant="body1" sx={{ fontWeight: 600, mt: 1 }}>
          {job.salary ?? 'A combinar'}
        </Typography>

        {job.specialties.length > 0 && (
          <div className="flex flex-wrap gap-xs mt-1">
            {job.specialties.slice(0, 3).map((specialty) => (
              <Chip key={specialty} label={specialty} size="small" />
            ))}
          </div>
        )}
      </CardContent>
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button component={Link} href={`/vagas/${job.id}`} variant="contained" fullWidth>
          Ver detalhes
        </Button>
      </CardActions>
    </Card>
  );
}
