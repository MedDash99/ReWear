// src/components/ui/ContentCard.tsx
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import BrokenImageIcon from '@mui/icons-material/BrokenImage';
import { styled, Theme, alpha } from '@mui/material/styles';

// Define the type for the item prop
type Item = {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl: string;
  category: string;
  sellerId: number | string;
  seller: {
    name: string | null;
    avatarUrl: string | null;
    // rating?: number;
    // reviewCount?: number;
  };
};

interface ContentCardProps {
  item: Item;
  isAuthenticated?: boolean;
  onLoginRequired?: () => void;
}

// Card container
const StyledCard = styled(Card)(({ theme }: { theme: Theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  maxWidth: 260,
  height: '100%',
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: theme.palette.common.white,
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[6],
  },
}));

// Image wrapper for square aspect ratio
const ImageContainer = styled(Box)(({ theme }: { theme: Theme }) => ({
  position: 'relative',
  width: '100%',
  paddingTop: '100%',
  overflow: 'hidden',
  backgroundColor: theme.palette.grey[200],
}));

// Media fits container
const StyledCardMedia = styled(CardMedia)({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
}) as typeof CardMedia;

// Favorite (heart) overlay button
const OverlayButton = styled(IconButton)(({ theme }: { theme: Theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  backgroundColor: alpha(theme.palette.common.white, 0.7),
  backdropFilter: 'blur(4px)',
  padding: theme.spacing(0.5),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.9),
  },
  '& .MuiSvgIcon-root': {
    fontSize: '1.25rem',
  },
}));

// Price badge overlay
const PriceBadge = styled(Box)(({ theme }: { theme: Theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(1),
  left: theme.spacing(1),
  backgroundColor: alpha(theme.palette.common.white, 0.9),
  padding: theme.spacing(0.25, 1),
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
}));

const ContentCard: React.FC<ContentCardProps> = ({ item, isAuthenticated, onLoginRequired }) => {
  const router = useRouter();
  const [imageError, setImageError] = React.useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    // Check if clicked element is specifically the favorite button or inside it
    const target = e.target as HTMLElement;
    const isFavoriteButton = target.closest('[aria-label="Favorite"]') || 
                            target.closest('.MuiIconButton-root') ||
                            target.tagName === 'svg' ||
                            target.closest('svg');
    
    if (isFavoriteButton) {
      return;
    }
    
    // Check authentication status
    if (!isAuthenticated) {
      // Show login modal for unauthenticated users
      onLoginRequired?.();
      return;
    }
    
    // Redirect authenticated users to product page
    router.push(`/products/${item.id}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    // TODO: implement favorite logic
  };

  const getInitials = (name: string | null | undefined): string => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    return parts.length > 1
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : name.substring(0, 1).toUpperCase();
  };

  const handleImageError = () => setImageError(true);

  return (
    <StyledCard>
      <CardActionArea
        onClick={handleCardClick}
        sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
      >
        <ImageContainer>
          {!imageError ? (
            <StyledCardMedia
              image={item.imageUrl}
              title={item.name}
              onError={handleImageError}
            />
          ) : (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'text.secondary',
              }}
            >
              <BrokenImageIcon fontSize="large" />
            </Box>
          )}

          <OverlayButton onClick={handleFavoriteClick} aria-label="Favorite">
            <FavoriteBorderIcon />
          </OverlayButton>
          <PriceBadge>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: theme => theme.palette.text.primary }}>
              ${item.price.toFixed(2)}
            </Typography>
          </PriceBadge>
        </ImageContainer>

        <CardContent sx={{ p: 1.5, flexGrow: 1 }}>
          <Typography
            variant="subtitle1"
            component="div"
            sx={{
              fontWeight: 500,
              color: theme => theme.palette.text.primary,
              lineHeight: 1.3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {item.name}
          </Typography>
        </CardContent>

        <Box sx={{ display: 'flex', alignItems: 'center', p: 1.5, pt: 0.5 }}>
          <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
            {item.seller.avatarUrl ? (
              <img
                src={item.seller.avatarUrl}
                alt={item.seller.name || ''}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              getInitials(item.seller.name)
            )}
          </Avatar>

          <Typography variant="caption" color="text.secondary" sx={{ flexGrow: 1, lineHeight: 1.2 }}>
            {item.seller.name || 'Unknown Seller'}
          </Typography>

          <Chip
            label={item.category}
            size="small"
            variant="outlined"
            sx={{ ml: 1, height: 24, fontSize: '0.625rem' }}
          />
        </Box>
      </CardActionArea>
    </StyledCard>
  );
};

export default ContentCard;
